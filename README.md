# nextjs-security-kit — copy-paste security primitives

[![CI](https://github.com/marchikx/nextjs-security-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/marchikx/nextjs-security-kit/actions/workflows/ci.yml)

Not a framework. Tiny helpers for CSRF (with TTL), SSRF URL checks, rate limit, audit hash chain, RBAC, PII redaction — testable without spinning Next.

**Who grabs this:** Next/App Router teams that need a checklist they can prove in CI.

```bash
npm test
```

Example middleware: `examples/next-app-router/middleware.ts`.

| Helper | Job |
|--------|-----|
| CSRF | Session-bound HMAC token + expiry |
| SSRF | Block private/metadata hosts before fetch |
| Rate limit | In-memory sliding window |
| Audit chain | Append-only hashes |

MIT · Hire: https://github.com/marchikx/marchikx/issues/new?template=hire.md
