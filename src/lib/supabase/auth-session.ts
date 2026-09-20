/** Chromium caps persistent cookies at 400 days. Refresh tokens renew access tokens inside this window. */
export const AUTH_COOKIE_MAX_AGE_SECONDS = 400 * 24 * 60 * 60;

export const authCookieOptions = {
  path: "/",
  sameSite: "lax" as const,
  maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
};

export const persistentBrowserAuth = {
  persistSession: true,
  autoRefreshToken: true,
  detectSessionInUrl: true,
};
