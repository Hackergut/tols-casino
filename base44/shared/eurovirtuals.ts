import { secrets } from "base44:runtime";
import { md5 } from "npm:js-md5@0.8.3";

// EuroVirtuals token: token = MD5(HEX(SHA1(appKey + timestamp)))
// SHA-1 via Web Crypto (SubtleCrypto supports SHA-1); MD5 is not in SubtleCrypto,
// so we use the pure-JS js-md5 package.

async function sha1Hex(str) {
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Generate the validation token from the App Key + x-timestamp header value.
export async function generateEuroVirtualsToken(appKey, timestamp) {
  const sha1 = await sha1Hex(String(appKey) + String(timestamp));
  return md5(sha1);
}

export function getEuroVirtualsAppKey() {
  return secrets.get("EUROVIRTUALS_APP_KEY") || "";
}

// Validate an incoming callback request.
// Reads `x-timestamp` from headers and the token from `x-token` header or `token` query param.
// Returns { valid, reason?, timestamp? }.
export async function validateEuroVirtualsCallback(req) {
  const appKey = getEuroVirtualsAppKey();
  if (!appKey) {
    return { valid: false, reason: "EUROVIRTUALS_APP_KEY secret not configured" };
  }
  const timestamp = req.headers.get("x-timestamp") || "";
  if (!timestamp) {
    return { valid: false, reason: "Missing x-timestamp header" };
  }
  const provided =
    req.headers.get("x-token") ||
    new URL(req.url).searchParams.get("token") ||
    "";
  if (!provided) {
    return { valid: false, reason: "Missing token (x-token header or token query param)" };
  }
  const expected = await generateEuroVirtualsToken(appKey, timestamp);
  return {
    valid: expected === provided,
    reason: expected === provided ? undefined : "Token mismatch",
    timestamp,
  };
}