import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const CHAINS = {
  ethereum: { rpc: "https://eth.llamarpc.com", cg: "ethereum", rateKey: "rate_ethereum", opKey: "operator_address_ethereum", decimals: 18, kind: "evm" },
  polygon: { rpc: "https://polygon-rpc.com", cg: "matic-network", rateKey: "rate_polygon", opKey: "operator_address_polygon", decimals: 18, kind: "evm" },
  solana: { rpc: "https://api.mainnet-beta.solana.com", cg: "solana", rateKey: "rate_solana", opKey: "operator_address_solana", decimals: 9, kind: "solana" },
};

async function rpc(url, body) {
  const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error("RPC error " + r.status);
  return r.json();
}

async function getPriceUsd(cgId) {
  try {
    const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cgId}&vs_currencies=usd`, { headers: { accept: "application/json" } });
    if (!r.ok) return null;
    const j = await r.json();
    return j && j[cgId] ? j[cgId].usd : null;
  } catch { return null; }
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Login required to verify deposits" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const chain = String(body.chain || "");
    const txHash = String(body.tx_hash || "").trim();
    const fromAddress = String(body.from_address || "").trim();
    const referralCode = String(body.referral_code || "").trim();
    const cfg = CHAINS[chain];
    if (!cfg || !txHash) return Response.json({ error: "Invalid request" }, { status: 400 });

    const settings = await base44.asServiceRole.entities.PlatformSetting.filter({ category: "payments" });
    const get = (k) => { const s = settings.find(x => x.key === k); return s ? s.value : ""; };
    // Per-user custodial deposit address (HD-derived for this user) is the
    // preferred recipient. Falls back to the shared operator address for legacy.
    const userWallets = await base44.asServiceRole.entities.UserWallet.filter({ created_by_id: user.id });
    let expectedTo = "";
    if (userWallets.length && userWallets[0].deposit_addresses) {
      try {
        const map = JSON.parse(userWallets[0].deposit_addresses);
        if (map && map[chain]) expectedTo = String(map[chain]);
      } catch {}
    }
    // Security: funds MUST land on this user's own HD-derived custodial address.
    // A shared operator address would let any user claim anyone else's transaction.
    if (!expectedTo) {
      return Response.json({ error: "Your personal deposit address is not ready yet. Open the Wallet page and retry." }, { status: 503 });
    }
    const operator = expectedTo;

    const dedupeKey = chain + ":" + txHash;
    const existing = await base44.asServiceRole.entities.Deposit.filter({ tx_hash: dedupeKey });
    if (existing.length && existing[0].status === "confirmed")
      return Response.json({ error: "This deposit was already credited", alreadyCredited: true }, { status: 409 });

    let amountNative = 0, fromOnChain = "", toOnChain = "", confirmed = false;
    try {
      if (cfg.kind === "evm") {
        const txRes = await rpc(cfg.rpc, { jsonrpc: "2.0", id: 1, method: "eth_getTransactionByHash", params: [txHash] });
        const tx = txRes && txRes.result;
        if (!tx) return Response.json({ error: "Transaction not found on-chain yet. Wait a few seconds and retry." }, { status: 404 });
        const recRes = await rpc(cfg.rpc, { jsonrpc: "2.0", id: 1, method: "eth_getTransactionReceipt", params: [txHash] });
        const rec = recRes && recRes.result;
        if (!rec) return Response.json({ error: "Transaction not confirmed yet. Wait for a block and retry." }, { status: 425 });
        if (rec.status !== "0x1") return Response.json({ error: "Transaction failed on-chain" }, { status: 422 });
        if ((tx.to || "").toLowerCase() !== operator.toLowerCase())
          return Response.json({ error: "Funds were not sent to the platform deposit address" }, { status: 422 });
        if (fromAddress && (tx.from || "").toLowerCase() !== fromAddress.toLowerCase())
          return Response.json({ error: "Sender does not match your connected wallet" }, { status: 422 });
        const wei = BigInt(tx.value || "0x0");
        const dec = BigInt(cfg.decimals);
        const whole = wei / (10n ** dec);
        const frac = wei % (10n ** dec);
        amountNative = Number(whole) + Number(frac) / Number(10n ** dec);
        fromOnChain = tx.from || ""; toOnChain = tx.to || ""; confirmed = true;
      } else {
        const solRes = await rpc(cfg.rpc, { jsonrpc: "2.0", id: 1, method: "getTransaction", params: [txHash, { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 }] });
        const tx = solRes && solRes.result;
        if (!tx) return Response.json({ error: "Transaction not found on-chain yet. Wait a few seconds and retry." }, { status: 404 });
        if (tx.meta && tx.meta.err) return Response.json({ error: "Transaction failed on-chain" }, { status: 422 });
        let lamports = 0, dest = "", src = "";
        const check = (ix) => {
          if (ix && ix.programId === "11111111111111111111111111111111" && ix.parsed && ix.parsed.type === "transfer") {
            const info = ix.parsed.info || {};
            if ((info.destination || "") === operator) { lamports = Number(info.lamports || 0); dest = info.destination; src = info.source; }
          }
        };
        (tx.transaction && tx.transaction.message ? tx.transaction.message.instructions : []).forEach(check);
        if (!lamports && tx.meta && tx.meta.innerInstructions) {
          for (const inner of tx.meta.innerInstructions) { (inner.instructions || []).forEach(check); }
        }
        if (!lamports) return Response.json({ error: "No native SOL transfer to the platform address found in this transaction" }, { status: 422 });
        if (fromAddress && src && src !== fromAddress) return Response.json({ error: "Sender does not match your connected wallet" }, { status: 422 });
        amountNative = lamports / Math.pow(10, cfg.decimals);
        fromOnChain = src; toOnChain = dest; confirmed = true;
      }
    } catch (e) {
      return Response.json({ error: "On-chain verification failed: " + (e.message || "unknown") }, { status: 502 });
    }

    if (!confirmed || amountNative <= 0) return Response.json({ error: "Could not verify a valid deposit" }, { status: 422 });

    let price = await getPriceUsd(cfg.cg);
    if (!price) {
      const rateStr = get(cfg.rateKey);
      price = rateStr ? parseFloat(rateStr) : null;
    }
    if (!price) return Response.json({ error: "Cannot determine exchange rate. Set a fallback rate in Admin → Payment settings." }, { status: 503 });
    const usdt = +(amountNative * price).toFixed(2);
    if (usdt <= 0) return Response.json({ error: "Deposit amount too small" }, { status: 422 });

    const wallets = await base44.asServiceRole.entities.UserWallet.filter({ created_by_id: user.id });
    if (!wallets.length) return Response.json({ error: "No wallet found. Open the Wallet page first." }, { status: 404 });
    const w = wallets[0];
    const newBalance = +(Number(w.balance || 0) + usdt).toFixed(2);
    await base44.asServiceRole.entities.UserWallet.update(w.id, { balance: newBalance });

    // Create the deposit as "pending" first, then transition to "confirmed".
    // The pending -> confirmed update fires the "Deposit Affiliate Commission"
    // workflow (which watches Deposit updates into "confirmed"). Creating the
    // record directly as "confirmed" would skip that trigger entirely.
    let depId;
    if (existing.length) {
      depId = existing[0].id;
    } else {
      const created = await base44.asServiceRole.entities.Deposit.create({
        chain, tx_hash: dedupeKey, currency: "USDT",
        status: "pending", credited: false, referral_code: referralCode,
        from_address: fromOnChain, to_address: toOnChain,
      });
      depId = created.id;
    }
    await base44.asServiceRole.entities.Deposit.update(depId, {
      status: "pending", referral_code: referralCode,
    });
    await base44.asServiceRole.entities.Deposit.update(depId, {
      status: "confirmed", credited: true, amount: usdt,
      from_address: fromOnChain, to_address: toOnChain,
    });

    return Response.json({ success: true, credited: usdt, newBalance, nativeAmount: amountNative, price });
  } catch (error) {
    return Response.json({ error: error.message || "Verification error" }, { status: 500 });
  }
}