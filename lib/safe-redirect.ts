/** Pages a person shouldn't be sent back to after signing in: going there
 * would just show another sign-in form (or a spent one-time link). */
const AUTH_PATHS = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
]);

export const DEFAULT_AFTER_AUTH = "/account";

/**
 * The `next` value if it is a same-origin, relative path that is safe to
 * redirect to after login or registration, otherwise null.
 *
 * Everything in a URL is attacker-controlled, so this rejects absolute URLs
 * ("https://evil.example"), protocol-relative ones ("//evil.example"),
 * backslash tricks browsers normalise to "//" ("/\evil.example"), control
 * characters, and anything that resolves to a different origin.
 */
export function safeNextPath(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (raw.length > 2048) return null;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return null;
  if (/[\u0000-\u001f\u007f\\]/.test(raw)) return null;

  const base = "https://instanta.invalid";
  let url: URL;
  try {
    url = new URL(raw, base);
  } catch {
    return null;
  }
  if (url.origin !== base) return null;
  if (AUTH_PATHS.has(url.pathname.replace(/\/+$/, "") || "/")) return null;

  return `${url.pathname}${url.search}${url.hash}`;
}

/** Where to go after signing in: a validated `next`, or the account home. */
export function afterAuthPath(raw: string | null | undefined): string {
  return safeNextPath(raw) ?? DEFAULT_AFTER_AUTH;
}

/** `href` with a validated `next` carried along, so moving between the
 * login, register and forgot-password pages keeps the return destination. */
export function withNext(href: string, raw: string | null | undefined): string {
  const next = safeNextPath(raw);
  if (!next) return href;
  const sep = href.includes("?") ? "&" : "?";
  return `${href}${sep}next=${encodeURIComponent(next)}`;
}
