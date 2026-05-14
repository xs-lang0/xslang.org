export function matchScore(query: string, target: string): number {
  if (!query) return 0;
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (t.startsWith(q)) return 100;
  if (t.includes(q)) return 60;
  const initials = t.split(/[^a-z0-9]+/).filter(Boolean).map(w => w[0]).join("");
  if (initials.includes(q)) return 50;
  return 0;
}

export type Hit = { slug: string; title: string; section: string; score: number };

export function search(index: Array<{ slug: string; title: string }>, query: string, limit = 12): Hit[] {
  const out: Hit[] = [];
  for (const p of index) {
    const score = matchScore(query, p.title);
    if (score > 0) {
      const [section] = p.slug.split("/");
      out.push({ slug: p.slug, title: p.title, section, score });
    }
  }
  return out.sort((a, b) => b.score - a.score).slice(0, limit);
}
