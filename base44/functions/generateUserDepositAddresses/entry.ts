import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';
import { Mnemonic, HDNodeWallet } from 'npm:ethers@6.13.4';
import { Keypair } from 'npm:@solana/web3.js@1.95.4';

// Derives a unique custodial deposit address per user from the platform's
// BIP39 master seed (PLATFORM_WALLET_SEED). The platform controls the
// corresponding private keys offline; only public addresses are stored here.
//   EVM (ethereum + polygon):  m/44'/60'/0'/0/<index>  (standard, ethers)
//   Solana:                    deterministic HMAC-SHA256(seed, "solana:<index>")
//                              -> 32-byte seed -> Keypair (custodial, non-standard
//                              but deterministic & collision-free)
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Login required' }, { status: 401 });

    const wallets = await base44.asServiceRole.entities.UserWallet.filter({ created_by_id: user.id });
    if (!wallets.length) return Response.json({ error: 'No wallet found. Open the Wallet page first.' }, { status: 404 });
    const w = wallets[0];

    // Idempotent: return existing per-user addresses if already generated.
    if (w.deposit_addresses) {
      try {
        const parsed = JSON.parse(w.deposit_addresses);
        if (parsed && (parsed.ethereum || parsed.solana)) {
          return Response.json({ addresses: parsed, index: w.deposit_index || 0 });
        }
      } catch {}
    }

    const seed = secrets.get('PLATFORM_WALLET_SEED');
    if (!seed) return Response.json({ error: 'Platform wallet seed not configured. Set PLATFORM_WALLET_SEED in app secrets.' }, { status: 503 });

    // Allocate a unique, monotonic derivation index per user (counter in PlatformSetting).
    const counterRows = await base44.asServiceRole.entities.PlatformSetting.filter({ key: 'deposit_user_counter' });
    let index;
    if (counterRows.length) {
      index = Number(counterRows[0].value || 0) + 1;
      await base44.asServiceRole.entities.PlatformSetting.update(counterRows[0].id, { value: String(index) });
    } else {
      index = 1;
      await base44.asServiceRole.entities.PlatformSetting.create({ key: 'deposit_user_counter', value: '1', category: 'wallets' });
    }

    const mn = Mnemonic.fromPhrase(seed);

    // EVM: Ethereum & Polygon share the same address (same key, same address).
    const evmNode = HDNodeWallet.fromMnemonic(mn, "m/44'/60'/0'/0/" + index);
    const evmAddress = evmNode.address;

    // Solana: deterministic 32-byte seed via HMAC-SHA256 over the BIP39 seed.
    const seedBytes = mn.computeSeed();
    const enc = new TextEncoder();
    const hmacKey = await crypto.subtle.importKey('raw', seedBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const solSeedBuf = await crypto.subtle.sign('HMAC', hmacKey, enc.encode('solana:' + index));
    const solKeypair = Keypair.fromSeed(new Uint8Array(solSeedBuf));
    const solAddress = solKeypair.publicKey.toBase58();

    const addresses = { ethereum: evmAddress, polygon: evmAddress, solana: solAddress };

    await base44.asServiceRole.entities.UserWallet.update(w.id, {
      deposit_addresses: JSON.stringify(addresses),
      deposit_index: index,
    });

    return Response.json({ addresses, index });
  } catch (error) {
    return Response.json({ error: error.message || 'Generation error' }, { status: 500 });
  }
}