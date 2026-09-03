import { fail, json } from "@/lib/http";
import { readSession } from "@/lib/session";
import { getStore } from "@/lib/store";

export async function GET() {
  const user = await readSession();
  if (!user) return fail("Sign in required.", 401);
  const products = await getStore().listProducts(user.id);
  return json({ products });
}
