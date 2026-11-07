import { cookies } from "next/headers";
import { supabaseConfigured } from "./env";
import { createSupabaseServer } from "./supabase";
import { getStore } from "./store";
import type { SessionUser } from "./types";

const COOKIE = "ownershot_session";

export async function readSession(): Promise<SessionUser | null> {
  if (supabaseConfigured()) {
    const supabase = await createSupabaseServer();
    if (supabase) {
      const { data } = await supabase.auth.getUser();
      if (data.user?.email) {
        return {
          id: data.user.id,
          email: data.user.email,
          source: "supabase",
        };
      }
    }
  }
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SessionUser;
    if (parsed?.id && parsed?.email) return parsed;
  } catch {
    return null;
  }
  return null;
}

export async function writeLocalSession(user: SessionUser) {
  const jar = await cookies();
  jar.set(COOKIE, JSON.stringify(user), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
  if (supabaseConfigured()) {
    const supabase = await createSupabaseServer();
    await supabase?.auth.signOut();
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await readSession();
  if (!user) {
    throw new Error("SIGN_IN_REQUIRED");
  }
  return user;
}

export async function ensureShop(user: SessionUser) {
  const store = getStore();
  return store.ensureShop(user);
}
