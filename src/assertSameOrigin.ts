export type SameOriginHeaders = {
  origin?: string | null;
  referer?: string | null;
};

function normalizeOrigin(value: string): string | null {
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}`.toLowerCase();
  } catch {
    return null;
  }
}

function originFromReferer(referer: string): string | null {
  return normalizeOrigin(referer);
}

/**
 * Returns true when Origin or Referer matches one of the allowed origins.
 */
export function assertSameOrigin(
  headers: SameOriginHeaders,
  allowlist: readonly string[],
): boolean {
  if (allowlist.length === 0) {
    return false;
  }
  const allowed = new Set(
    allowlist.map((o) => normalizeOrigin(o)).filter((o): o is string => o !== null),
  );
  if (allowed.size === 0) {
    return false;
  }

  const originHeader = headers.origin?.trim();
  if (originHeader && originHeader !== "null") {
    const normalized = normalizeOrigin(originHeader);
    if (normalized && allowed.has(normalized)) {
      return true;
    }
  }

  const referer = headers.referer?.trim();
  if (referer) {
    const fromReferer = originFromReferer(referer);
    if (fromReferer && allowed.has(fromReferer)) {
      return true;
    }
  }

  return false;
}
