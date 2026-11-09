/**
 * Example App Router middleware wiring for nextjs-security-kit.
 * Copy into a Next.js app's middleware.ts and set CSRF_SECRET.
 */
import { NextResponse, type NextRequest } from "next/server";
import { createToken, verifyToken } from "../../src/csrf.js";
import { isAllowedUrl } from "../../src/ssrfGuard.js";

const SECRET = process.env.CSRF_SECRET ?? "dev-only-change-me";

export function middleware(req: NextRequest) {
  const sessionId = req.cookies.get("sid")?.value ?? "anon";

  if (req.method === "GET" && req.nextUrl.pathname === "/api/csrf") {
    const token = createToken(SECRET, sessionId);
    const res = NextResponse.json({ csrfToken: token });
    res.cookies.set("sid", sessionId, { httpOnly: true, sameSite: "lax" });
    return res;
  }

  if (req.method === "POST") {
    const token = req.headers.get("x-csrf-token") ?? "";
    if (!verifyToken(SECRET, sessionId, token)) {
      return NextResponse.json({ error: "csrf" }, { status: 403 });
    }
    const target = req.nextUrl.searchParams.get("fetch");
    if (target && !isAllowedUrl(target)) {
      return NextResponse.json({ error: "ssrf" }, { status: 400 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
