import { cookies } from "next/headers";
import { fail, json } from "@/lib/http";
import { supabaseConfigured } from "@/lib/env";
import { createSupabaseServer } from "@/lib/supabase";
import { id } from "@/lib/ids";
import { writeLocalSession, readSession, clearSession } from "@/lib/session";
import { getStore } from "@/lib/store";

export async function GET() {
  const user = await readSession();
  return json({ user });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    mode?: "magic" | "google" | "local";
  };
  const email = (body.email ?? "").trim().toLowerCase();

  if (body.mode === "google" && supabaseConfigured()) {
    const supabase = await createSupabaseServer();
    if (!supabase) return fail("NEXT_PUBLIC_SUPABASE_URL missing", 503);
    const origin = new URL(request.url).origin;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/studio/auth/callback` },
    });
    if (error) return fail(error.message, 400);
    return json({ url: data.url });
  }

  if (body.mode === "magic" && supabaseConfigured()) {
    if (!email) return fail("Email is required.");
    const supabase = await createSupabaseServer();
    if (!supabase) return fail("NEXT_PUBLIC_SUPABASE_URL missing", 503);
    const origin = new URL(request.url).origin;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${origin}/studio/auth/callback` },
    });
    if (error) return fail(error.message, 400);
    return json({ sent: true, provider: "supabase" });
  }

  if (!email) return fail("Email is required.");
  const store = getStore();
  const existing = await store.userByEmail(email);
  const user =
    existing ??
    (await store.rememberUser({
      id: `local-${id()}`,
      email,
      source: "local",
    }));
  await writeLocalSession(user);
  await store.ensureShop(user);
  return json({ user, provider: "local" });
}

export async function DELETE() {
  await clearSession();
  const jar = await cookies();
  for (const c of jar.getAll()) {
    if (c.name.startsWith("sb-")) jar.delete(c.name);
  }
  return json({ ok: true });
}
