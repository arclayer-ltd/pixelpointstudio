import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl(),
      lastModified: new Date("2026-09-03"),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
