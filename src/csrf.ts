import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const TOKEN_BYTES = 16;
const DEFAULT_TTL_MS = 60 * 60 * 1000;

function signPayload(
  secret: string,
  sessionId: string,
  nonce: string,
  exp: string,
): string {
  return createHmac("sha256", secret)
    .update(`${sessionId}:${nonce}:${exp}`)
    .digest("hex");
}

/**
 * Creates a CSRF token bound to a session via HMAC with expiry (TTL).
 * Format: nonce.expMs.signature
 */
export function createToken(
  secret: string,
  sessionId: string,
  ttlMs: number = DEFAULT_TTL_MS,
  now: number = Date.now(),
): string {
  if (!secret || !sessionId) {
    throw new Error("secret and sessionId are required");
  }
  const nonce = randomBytes(TOKEN_BYTES).toString("hex");
  const exp = String(now + ttlMs);
  const signature = signPayload(secret, sessionId, nonce, exp);
  return `${nonce}.${exp}.${signature}`;
}

/**
 * Verifies a CSRF token for the given session and TTL.
 */
export function verifyToken(
  secret: string,
  sessionId: string,
  token: string,
  now: number = Date.now(),
): boolean {
  if (!secret || !sessionId || !token) {
    return false;
  }
  const parts = token.split(".");
  if (parts.length !== 3) {
    return false;
  }
  const [nonce, exp, providedSig] = parts;
  if (!/^[0-9a-f]+$/i.test(nonce) || !/^[0-9]+$/.test(exp) || !/^[0-9a-f]+$/i.test(providedSig)) {
    return false;
  }
  if (Number(exp) < now) {
    return false;
  }
  const expected = signPayload(secret, sessionId, nonce, exp);
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
