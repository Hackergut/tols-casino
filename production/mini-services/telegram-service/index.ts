// Telegram Notification Service for TOLS Admin Platform
// Port: 3005 | Bun native HTTP server

import { PrismaClient } from '@prisma/client';

// ==================== Configuration ====================

const PORT = 3005;
const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';
const MAX_MESSAGE_LENGTH = 4096;
const DEFAULT_PARSE_MODE = 'HTML';

// In-memory bot token storage
let botToken: string | null = process.env.TELEGRAM_BOT_TOKEN ?? null;

// ==================== Database ====================

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/home/z/my-project/db/custom.db',
    },
  },
});

// ==================== Helpers ====================

interface JsonResp {
  status: number;
  body: unknown;
}

function json(status: number, body: unknown): JsonResp {
  return { status, body };
}

function truncateMessage(text: string, maxLength: number = MAX_MESSAGE_LENGTH): string {
  if (text.length <= maxLength) return text;
  const truncated = text.slice(0, maxLength - 20);
  // Try to break at last newline for cleaner truncation
  const lastNewline = truncated.lastIndexOf('\n');
  const cutPoint = lastNewline > maxLength * 0.5 ? lastNewline : truncated.length;
  return text.slice(0, cutPoint) + '\n\n<i>... message truncated</i>';
}

async function readBody(req: Request): Promise<string> {
  return await req.text();
}

function safeJson<T = unknown>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function log(level: string, message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [TELEGRAM-SERVICE] [${level}]`;
  if (data !== undefined) {
    console.log(`${prefix} ${message}`, typeof data === 'string' ? data : JSON.stringify(data));
  } else {
    console.log(`${prefix} ${message}`);
  }
}

function formatTimestamp(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
}

// ==================== Event Type Emojis ====================

const EVENT_EMOJI_MAP: Record<string, string> = {
  deposit: '🟢',
  withdrawal: '🔴',
  streak_win: '🔥',
  streak_loss: '❄️',
  big_win: '🏆',
  big_loss: '⚠️',
  new_player: '👤',
  control_applied: '🎮',
};

const SEVERITY_INDICATOR: Record<string, string> = {
  info: 'ℹ️ INFO',
  warning: '⚡ WARNING',
  critical: '🔴 CRITICAL',
};

// ==================== Core Send Logic ====================

async function sendTelegramMessage(params: {
  chatId: string;
  threadId?: string;
  message: string;
  parseMode?: string;
}): Promise<{ success: boolean; messageId?: number; error?: string }> {
  const { chatId, threadId, message, parseMode = DEFAULT_PARSE_MODE } = params;

  if (!botToken) {
    const errMsg = 'Bot token not configured. Call POST /config first.';
    log('ERROR', errMsg);
    return { success: false, error: errMsg };
  }

  const truncated = truncateMessage(message);

  const payload: Record<string, unknown> = {
    chat_id: chatId,
    text: truncated,
    parse_mode: parseMode,
  };

  if (threadId) {
    payload.message_thread_id = threadId;
  }

  const url = `${TELEGRAM_API_BASE}${botToken}/sendMessage`;

  try {
    log('INFO', `Sending message to chat ${chatId}${threadId ? ` (thread: ${threadId})` : ''}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json() as Record<string, unknown>;

    if (data.ok) {
      const result = data.result as Record<string, unknown>;
      const messageId = result.message_id as number;
      log('INFO', `Message sent successfully. messageId: ${messageId}`);
      return { success: true, messageId };
    } else {
      const description = (data.description as string) || 'Unknown Telegram API error';
      log('ERROR', `Telegram API error: ${description}`);
      return { success: false, error: description };
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    log('ERROR', `Failed to send message: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
}

// ==================== Route Handlers ====================

async function handleHealthCheck(): Promise<JsonResp> {
  let pendingCount = 0;
  try {
    pendingCount = await prisma.telegramNotification.count({
      where: { status: 'pending' },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    log('WARN', `Failed to count pending notifications: ${msg}`);
  }

  return json(200, {
    status: 'running',
    port: PORT,
    pendingCount,
    configured: botToken !== null,
    uptime: process.uptime(),
  });
}

async function handleSend(body: Record<string, unknown>): Promise<JsonResp> {
  const { chatId, threadId, message, parseMode } = body;

  if (!chatId || typeof chatId !== 'string') {
    return json(400, { success: false, error: 'chatId is required and must be a string' });
  }
  if (!message || typeof message !== 'string') {
    return json(400, { success: false, error: 'message is required and must be a string' });
  }

  const result = await sendTelegramMessage({
    chatId,
    threadId: threadId as string | undefined,
    message,
    parseMode: (parseMode as string) || DEFAULT_PARSE_MODE,
  });

  return json(result.success ? 200 : 500, result);
}

async function handleSendAlert(body: Record<string, unknown>): Promise<JsonResp> {
  const { chatId, threadId, eventType, title, message, severity } = body;

  if (!chatId || typeof chatId !== 'string') {
    return json(400, { success: false, error: 'chatId is required and must be a string' });
  }
  if (!eventType || typeof eventType !== 'string') {
    return json(400, { success: false, error: 'eventType is required and must be a string' });
  }
  if (!title || typeof title !== 'string') {
    return json(400, { success: false, error: 'title is required and must be a string' });
  }
  if (!message || typeof message !== 'string') {
    return json(400, { success: false, error: 'message is required and must be a string' });
  }

  // Build formatted alert message
  const emoji = EVENT_EMOJI_MAP[eventType] || '📢';
  const lines: string[] = [];

  // Emoji + event type header
  lines.push(`${emoji} <b>${escapeHtml(title)}</b>`);
  lines.push('');

  // Severity indicator
  if (severity && typeof severity === 'string') {
    const severityLabel = SEVERITY_INDICATOR[severity];
    if (severityLabel) {
      lines.push(severityLabel);
      lines.push('');
    }
  }

  // Event type tag
  lines.push(`<code>${escapeHtml(eventType)}</code>`);
  lines.push('');

  // Message body
  lines.push(escapeHtml(message));
  lines.push('');

  // Timestamp
  lines.push(`<i>${formatTimestamp()}</i>`);

  const formattedMessage = lines.join('\n');

  log('INFO', `Sending alert: ${eventType} - ${title}`);

  const result = await sendTelegramMessage({
    chatId,
    threadId: threadId as string | undefined,
    message: formattedMessage,
  });

  return json(result.success ? 200 : 500, result);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function handleProcessQueue(): Promise<JsonResp> {
  let processed = 0;
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  try {
    const pending = await prisma.telegramNotification.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' },
    });

    if (pending.length === 0) {
      log('INFO', 'No pending notifications to process');
      return json(200, { processed: 0, sent: 0, failed: 0 });
    }

    log('INFO', `Processing ${pending.length} pending notification(s)`);

    for (const notification of pending) {
      processed++;

      // Build the alert message
      const emoji = EVENT_EMOJI_MAP[notification.eventType] || '📢';
      const lines: string[] = [];

      lines.push(`${emoji} <b>${escapeHtml(notification.title)}</b>`);
      lines.push('');
      lines.push(`<code>${escapeHtml(notification.eventType)}</code>`);
      lines.push('');
      lines.push(escapeHtml(notification.message));
      lines.push('');
      lines.push(`<i>${formatTimestamp()}</i>`);

      const formattedMessage = lines.join('\n');

      const result = await sendTelegramMessage({
        chatId: notification.chatId,
        threadId: notification.threadId ?? undefined,
        message: formattedMessage,
      });

      if (result.success) {
        sent++;
        await prisma.telegramNotification.update({
          where: { id: notification.id },
          data: {
            status: 'sent',
            sentAt: new Date(),
          },
        });
      } else {
        failed++;
        const errorMsg = result.error || 'Unknown error';
        errors.push(`${notification.id}: ${errorMsg}`);
        await prisma.telegramNotification.update({
          where: { id: notification.id },
          data: {
            status: 'failed',
            errorMessage: errorMsg,
            sentAt: new Date(),
          },
        });
      }
    }

    log('INFO', `Queue processed: ${processed} total, ${sent} sent, ${failed} failed`);

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    log('ERROR', `Queue processing error: ${errorMessage}`);
    return json(500, {
      processed,
      sent,
      failed,
      error: errorMessage,
    });
  }

  const response: Record<string, unknown> = { processed, sent, failed };
  if (errors.length > 0) {
    response.errors = errors;
  }

  return json(200, response);
}

function handleSetConfig(body: Record<string, unknown>): JsonResp {
  const { botToken: token } = body;

  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    return json(400, { configured: false, error: 'botToken is required and must be a non-empty string' });
  }

  botToken = token.trim();
  log('INFO', 'Bot token configured successfully');
  // Log token prefix only for security
  log('INFO', `Token prefix: ${botToken.slice(0, 8)}...`);

  return json(200, { configured: true });
}

function handleGetConfig(): JsonResp {
  return json(200, {
    configured: botToken !== null,
    tokenPrefix: botToken ? botToken.slice(0, 8) + '...' : null,
  tokenLength: botToken ? botToken.length : 0,
  source: process.env.TELEGRAM_BOT_TOKEN ? 'env' : (botToken ? 'memory' : 'none'),
  });
}

// ==================== Router ====================

function getMethod(req: Request): string {
  return req.method.toUpperCase();
}

function getPath(req: Request): string {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  return url.pathname;
}

async function router(req: Request): Promise<JsonResp> {
  const method = getMethod(req);
  const path = getPath(req);

  // Log all incoming requests
  log('INFO', `${method} ${path}`);

  try {
    // Health check
    if (method === 'GET' && path === '/') {
      return await handleHealthCheck();
    }

    // Get config
    if (method === 'GET' && path === '/config') {
      return handleGetConfig();
    }

    // POST routes - read body once
    if (method === 'POST') {
      // /process-queue does not require a body
      if (path === '/process-queue') {
        return await handleProcessQueue();
      }

      const rawBody = await readBody(req);
      const body = safeJson<Record<string, unknown>>(rawBody);

      if (!body) {
        return json(400, { error: 'Invalid JSON body' });
      }

      if (path === '/send') {
        return await handleSend(body);
      }

      if (path === '/send-alert') {
        return await handleSendAlert(body);
      }

      if (path === '/config') {
        return handleSetConfig(body);
      }
    }

    // 404 - Method Not Allowed / Not Found
    return json(404, {
      error: 'Not found',
      availableEndpoints: [
        'GET  /',
        'GET  /config',
        'POST /send',
        'POST /send-alert',
        'POST /process-queue',
        'POST /config',
      ],
    });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    log('ERROR', `Unhandled error on ${method} ${path}: ${errorMessage}`);
    return json(500, { error: 'Internal server error', details: errorMessage });
  }
}

// ==================== Server ====================

console.log(`\n🚀 Telegram Notification Service starting...`);
console.log(`   Port: ${PORT}`);
console.log(`   DB:   file:/home/z/my-project/db/custom.db`);
console.log(`   Token: ${botToken ? 'configured from env' : 'not configured - call POST /config'}\n`);

const server = Bun.serve({
  port: PORT,
  async fetch(req: Request): Promise<Response> {
    const { status, body } = await router(req);
    return Response.json(body, { status });
  },
});

console.log(`✅ Telegram Notification Service running on port ${server.port}`);
console.log(`   Endpoints:`);
console.log(`     GET  /              → Health check & status`);
console.log(`     GET  /config        → Check bot configuration`);
console.log(`     POST /send          → Send a raw message`);
console.log(`     POST /send-alert    → Send a formatted alert`);
console.log(`     POST /process-queue → Process pending notifications`);
console.log(`     POST /config        → Set bot token`);
console.log('');
