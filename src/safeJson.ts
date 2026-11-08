export type SafeJsonResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: "empty" | "too_large" | "invalid_json" };

export type SafeJsonOptions = {
  maxBytes: number;
};

const defaultOptions: SafeJsonOptions = { maxBytes: 1_048_576 };

function byteLength(input: string): number {
  return Buffer.byteLength(input, "utf8");
}

/**
 * Parses JSON with an UTF-8 byte size cap to reduce denial-of-service risk.
 */
export function safeJsonParse<T = unknown>(
  input: string,
  options: Partial<SafeJsonOptions> = {},
): SafeJsonResult<T> {
  const { maxBytes } = { ...defaultOptions, ...options };
  if (maxBytes <= 0) {
    return { ok: false, error: "too_large" };
  }
  if (input.length === 0) {
    return { ok: false, error: "empty" };
  }
  if (byteLength(input) > maxBytes) {
    return { ok: false, error: "too_large" };
  }
  try {
    const value = JSON.parse(input) as T;
    return { ok: true, value };
  } catch {
    return { ok: false, error: "invalid_json" };
  }
}
