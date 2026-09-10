import { supabase } from "@/integrations/supabase/client";

/**
 * Admin authentication backed by Supabase Auth.
 *
 * This used to compare against a username/password hardcoded in this file,
 * which shipped in the JS bundle for anyone to read, and gated nothing but the
 * UI — every write still went out with the public anon key. Now the session is a
 * real Supabase JWT, and RLS only grants writes to the `authenticated` role, so
 * the check is enforced by the database rather than by the browser.
 */

export async function login(
  email: string,
  password: string
): Promise<{ ok: boolean; message?: string }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      ok: false,
      message:
        error.message === "Invalid login credentials"
          ? "Email o contraseña incorrectos"
          : error.message,
    };
  }
  return { ok: true };
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}

/** Resolves the current session (async: it may be restored from storage). */
export async function isAuthenticated(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

/** Fires whenever the session appears or disappears (incl. token refresh). */
export function onAuthChange(cb: (authed: boolean) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    cb(!!session);
  });
  return () => data.subscription.unsubscribe();
}
