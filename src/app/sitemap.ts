import type { MetadataRoute } from "next";
import { docsTree } from "@/lib/docs-tree";

const BASE = "https://xslang.org";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();
  const top: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,            lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/docs`,        lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/playground`,  lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/downloads`,   lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
  ];
  const docs: MetadataRoute.Sitemap = docsTree.flatMap(s =>
    s.pages.map(p => ({
      url: `${BASE}/docs/${s.id}/${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }))
  );
  return [...top, ...docs];
}
