import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const TOKEN_BYTES = 16;

function signPayload(secret: string, sessionId: string, nonce: string): string {
  return createHmac("sha256", secret)
    .update(`${sessionId}:${nonce}`)
    .digest("hex");
}

/**
 * Creates a CSRF token bound to a session via HMAC.
 */
export function createToken(secret: string, sessionId: string): string {
  if (!secret || !sessionId) {
    throw new Error("secret and sessionId are required");
  }
  const nonce = randomBytes(TOKEN_BYTES).toString("hex");
  const signature = signPayload(secret, sessionId, nonce);
  return `${nonce}.${signature}`;
}

/**
 * Verifies a CSRF token for the given session.
 */
export function verifyToken(
  secret: string,
  sessionId: string,
  token: string,
): boolean {
  if (!secret || !sessionId || !token) {
    return false;
  }
  const dot = token.indexOf(".");
  if (dot <= 0) {
    return false;
  }
  const nonce = token.slice(0, dot);
  const providedSig = token.slice(dot + 1);
  if (!/^[0-9a-f]+$/i.test(nonce) || !/^[0-9a-f]+$/i.test(providedSig)) {
    return false;
  }
  const expected = signPayload(secret, sessionId, nonce);
  try {
    const a = Buffer.from(providedSig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) {
      return false;
    }
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
