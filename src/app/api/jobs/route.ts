import { fail, json } from "@/lib/http";
import { readSession } from "@/lib/session";
import { getStore } from "@/lib/store";

export async function GET() {
  const user = await readSession();
  if (!user) return fail("Sign in required.", 401);
  const store = getStore();
  const shop = await store.ensureShop(user);
  const jobs = await store.listJobs(user.id);
  return json({ shop, jobs });
}

export async function POST() {
  const user = await readSession();
  if (!user) return fail("Sign in required.", 401);
  const store = getStore();
  const shop = await store.ensureShop(user);
  const job = await store.createJob({ owner: user, shop });
  return json({ job });
}
