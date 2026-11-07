import { siteUrl } from "@/lib/env";

export async function GET() {
  const url = siteUrl();
  const body = `# OwnerShot Ads

> A shop owner photographs their own product. The app writes original listing copy and makes original stills plus a 12–15 second ad. No stock, no celebrity, no third-party brands.

- Product: ${url}
- Studio (signed-in app): ${url}/studio
- Publisher: Pixelpoint Studio
`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
