// utils/base64urlToUint8Array.js (or inline)
export function base64urlToUint8Array(base64url) {
    if (!base64url) throw new Error("Missing VAPID public key");
    // remove whitespace/newlines just in case
    let b64 = base64url.trim().replace(/\s+/g, "");
    // convert URL-safe to standard base64
    b64 = b64.replace(/-/g, "+").replace(/_/g, "/");
    // pad to length multiple of 4
    const padLen = (4 - (b64.length % 4)) % 4;
    b64 += "=".repeat(padLen);
    // decode
    const raw = atob(b64);
    const out = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }
  