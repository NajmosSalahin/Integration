## [0.1.21] - 2026-09-20

**Status:** Pre-Release — v0.1.21 In Development

Admin "blank until refresh" bug — fixed at both layers. Intermittently the app opened to a fully blank (black) screen and only came back after a manual refresh; it hit every user and admin page. Root cause: a stale hashed chunk. After a redeploy the browser can hold an older `index.html` whose hashed chunk references no longer exist; those chunk requests fell through the server's SPA catch-all and came back as `index.html` with HTTP 200 (text/html), so the browser blocked the dynamic import as a "disallowed MIME type" — and since there was no error boundary anywhere, the whole tree unmounted to a white void.

**Fixes in v0.1.21**

| Area | Fix |
|---|---|
| Stale chunk recovery | New `lazyWithRetry` (wraps `React.lazy`): retries a failed dynamic `import()` and, for recoverable chunk failures (stale hash / `Failed to fetch` / disallowed MIME type), auto-reloads the page once (loop-guarded via `sessionStorage`) — this is exactly the manual refresh but automatic |
| Global crash screen | New top-level `ErrorBoundary` (class component) with a branded recovery screen + Reload button, so a crash never leaves a plain blank page again; chunk errors get a tailored message |
| No more 200-HTML-for-assets | Server: the SPA catch-all in `server.js` now returns a real 404 for paths that look like hashed assets (contain a file extension) instead of serving `index.html`, stopping stale-chunk HTML-poisoning and giving retries a clean 404 to recover from |

**Detailed snapshot:** [versions/v0.1.21.md](versions/v0.1.21.md)
