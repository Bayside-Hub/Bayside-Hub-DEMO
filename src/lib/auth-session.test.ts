import assert from "node:assert/strict";
import test from "node:test";
import { AUTH_COOKIE_MAX_AGE_SECONDS, authCookieOptions, persistentBrowserAuth } from "./supabase/auth-session.ts";

test("auth sessions persist for the browser maximum and refresh automatically", () => {
  assert.equal(AUTH_COOKIE_MAX_AGE_SECONDS, 34_560_000);
  assert.deepEqual(authCookieOptions, { path: "/", sameSite: "lax", maxAge: 34_560_000 });
  assert.equal(persistentBrowserAuth.persistSession, true);
  assert.equal(persistentBrowserAuth.autoRefreshToken, true);
});
