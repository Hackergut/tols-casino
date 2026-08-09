import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Server-side Telegram alert dispatcher. Credentials are read from
// PlatformSetting (category "ops") so an admin can rotate them without a
// redeploy: telegram_bot_token, telegram_chat_id, telegram_thread_id.
//
// Every attempt is audited in the TelegramAlert entity. The function is
// fire-and-forget from other backend code; the HTTP API is admin-only when
// invoked directly so players cannot spoof ops alerts.

type Event = 'registration' | 'login' | 'deposit' | 'withdrawal' | 'deposit_pending' | 'system';

function esc(s: string) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function getSettingMap(base44: any) {
  const rows = await base44.asServiceRole.entities.PlatformSetting.filter({ category: 'ops' }).catch(() => []);
  const m: Record<string, string> = {};
  for (const r of rows || []) m[r.key] = r.value || '';
  return m;
}

export default async function(req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Allow internal callers (workflows) with a token, otherwise require admin.
    const providedToken = String(body.internal_token || '');
    let authed = false;
    if (providedToken) {
      const cfg = await getSettingMap(base44);
      authed = providedToken === (cfg.internal_token || '');
    }
    if (!authed) {
      const me = await base44.auth.me().catch(() => null);
      authed = !!(me && me.role === 'admin');
    }
    if (!authed) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const event: Event = (body.event || 'system');
    const title = String(body.title || 'TOLS alert');
    const message = String(body.message || '');

    const cfg = await getSettingMap(base44);
    const token = cfg.telegram_bot_token;
    const chatId = cfg.telegram_chat_id;
    const threadId = cfg.telegram_thread_id;

    const record = await base44.asServiceRole.entities.TelegramAlert.create({
      event_type: event, title, message,
      chat_id: chatId || '', status: 'pending',
    });

    if (!token || !chatId) {
      await base44.asServiceRole.entities.TelegramAlert.update(record.id, {
        status: 'unconfigured', error_message: 'telegram_bot_token or telegram_chat_id not set',
      });
      return Response.json({ ok: false, status: 'unconfigured' });
    }

    const text = `<b>${esc(title)}</b>\n${esc(message)}`;
    let ok = false;
    let errMsg = '';
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_thread_id: threadId ? Number(threadId) : undefined,
          text, parse_mode: 'HTML', disable_web_page_preview: true,
        }),
      });
      ok = res.ok;
      if (!ok) errMsg = `HTTP ${res.status}: ${(await res.text().catch(() => '')).slice(0, 200)}`;
    } catch (e: any) {
      errMsg = e?.message || 'send error';
    }

    await base44.asServiceRole.entities.TelegramAlert.update(record.id, {
      status: ok ? 'sent' : 'failed',
      error_message: errMsg,
      sent_at: ok ? new Date().toISOString() : '',
    });
    return Response.json({ ok, status: ok ? 'sent' : 'failed' });
  } catch (error: any) {
    return Response.json({ error: error.message || 'Telegram error' }, { status: 500 });
  }
}
