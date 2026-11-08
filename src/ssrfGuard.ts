const METADATA_HOSTS = new Set(
  [
    "metadata.google.internal",
    "metadata.goog",
    "169.254.169.254",
    "instance-data",
  ].map((h) => h.toLowerCase()),
);

const BLOCKED_HOSTNAMES = new Set(["localhost", "0.0.0.0"]);

function parseIpv4(host: string): number[] | null {
  const parts = host.split(".");
  if (parts.length !== 4) {
    return null;
  }
  const octets: number[] = [];
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) {
      return null;
    }
    const n = Number(part);
    if (n < 0 || n > 255) {
      return null;
    }
    octets.push(n);
  }
  return octets;
}

function isPrivateIpv4(octets: number[]): boolean {
  const [a, b] = octets;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT / shared address space
  return false;
}

function isBlockedIpv6(host: string): boolean {
  const h = host.toLowerCase();
  if (h === "::1" || h === "::") {
    return true;
  }
  if (h.startsWith("fc") || h.startsWith("fd")) {
    return true;
  }
  if (h.startsWith("fe80:")) {
    return true;
  }
  if (h.startsWith("::ffff:")) {
    const v4 = h.slice("::ffff:".length);
    const mapped = parseIpv4(v4);
    if (mapped) {
      return isPrivateIpv4(mapped);
    }
  }
  return false;
}

function hostnameBlocked(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[/, "").replace(/\]$/, "");
  if (BLOCKED_HOSTNAMES.has(host) || METADATA_HOSTS.has(host)) {
    return true;
  }
  if (host.endsWith(".localhost") || host.endsWith(".local")) {
    return true;
  }
  const v4 = parseIpv4(host);
  if (v4) {
    return isPrivateIpv4(v4);
  }
  return isBlockedIpv6(host);
}

export type SsrfGuardResult =
  | { ok: true; url: URL }
  | { ok: false; reason: string };

/**
 * Rejects URLs that target private networks, link-local, or cloud metadata endpoints.
 */
export function ssrfGuard(input: string): SsrfGuardResult {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return { ok: false, reason: "invalid URL" };
  }

  const protocol = url.protocol.toLowerCase();
  if (protocol !== "http:" && protocol !== "https:") {
    return { ok: false, reason: "unsupported protocol" };
  }

  const hostname = url.hostname;
  if (!hostname) {
    return { ok: false, reason: "missing hostname" };
  }

  if (hostnameBlocked(hostname)) {
    return { ok: false, reason: "blocked host" };
  }

  return { ok: true, url };
}

/**
 * Returns true if the URL is allowed for outbound fetches.
 */
export function isAllowedUrl(input: string): boolean {
  return ssrfGuard(input).ok;
}
