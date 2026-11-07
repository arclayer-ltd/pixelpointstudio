import { healthReport } from "@/lib/env";
import { json } from "@/lib/http";

export async function GET() {
  return json(healthReport());
}
