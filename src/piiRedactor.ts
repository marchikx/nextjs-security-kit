const EMAIL_RE =
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

const PHONE_RE =
  /\b(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}\b/g;

const REDACTED = "[REDACTED]";

/**
 * Redacts common email addresses and phone-like digit sequences from free text.
 */
export function redactPii(text: string): string {
  return text
    .replace(EMAIL_RE, REDACTED)
    .replace(PHONE_RE, REDACTED);
}
