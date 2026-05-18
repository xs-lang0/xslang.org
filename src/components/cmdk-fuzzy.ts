export type Chunk = {
  pageTitle: string;
  pageSlug: string;
  sectionHeading: string;
  sectionAnchor: string;
  bodyText: string;
};

export type Hit = {
  pageTitle: string;
  pageSlug: string;
  sectionHeading: string;
  sectionAnchor: string;
  section: string;
  snippet: SnippetPart[];
  score: number;
};

export type SnippetPart = { text: string; mark: boolean };

// Score a single field. The weights are chosen so any title hit beats any
// heading hit beats any body hit, even if a body has multiple matches.
function fieldScore(query: string, target: string): number {
  if (!query || !target) return 0;
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (t === q) return 100;
  if (t.startsWith(q)) return 80;
  if (t.includes(q)) return 50;
  const initials = t.split(/[^a-z0-9]+/).filter(Boolean).map(w => w[0]).join("");
  if (initials.includes(q)) return 30;
  return 0;
}

// Kept for the standalone unit test on the bare scoring helper.
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

// Strip the "· XS Guide" suffix that lives on every page title, so the
// scoring focuses on the user-typed topic word.
function stripSuffix(t: string): string {
  return t.replace(/\s*[·,]\s*XS\s+(Guide|Reference|Stdlib|Docs)\s*$/i, "").trim();
}

// Pull a +/- 60-character window around the first body match, splitting it
// into marked / unmarked parts the renderer can wrap with `<mark>`.
export function makeSnippet(body: string, query: string, span = 60): SnippetPart[] {
  if (!body) return [];
  if (!query) {
    return [{ text: body.slice(0, 140), mark: false }];
  }
  const idx = body.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) {
    return [{ text: body.slice(0, 140), mark: false }];
  }
  const start = Math.max(0, idx - span);
  const end = Math.min(body.length, idx + query.length + span);
  const lead = (start > 0 ? "... " : "") + body.slice(start, idx);
  const hit = body.slice(idx, idx + query.length);
  const trail = body.slice(idx + query.length, end) + (end < body.length ? " ..." : "");
  return [
    { text: lead, mark: false },
    { text: hit, mark: true },
    { text: trail, mark: false },
  ];
}

// Score a chunk against the query. Title matches dominate, then headings,
// then body. Multiple body hits add a small boost so dense matches win over
// sparse ones, but never enough to outrank a heading match.
export function scoreChunk(chunk: Chunk, query: string): number {
  if (!query) return 0;
  const titleScore = fieldScore(query, stripSuffix(chunk.pageTitle));
  const headingScore = fieldScore(query, chunk.sectionHeading);
  const bodyScore = fieldScore(query, chunk.bodyText);
  let bodyHits = 0;
  if (chunk.bodyText) {
    const q = query.toLowerCase();
    const b = chunk.bodyText.toLowerCase();
    let i = b.indexOf(q);
    while (i >= 0 && bodyHits < 5) {
      bodyHits++;
      i = b.indexOf(q, i + q.length);
    }
  }
  const titleWeight = titleScore * 1000;
  const headingWeight = headingScore * 100;
  const bodyWeight = bodyScore + Math.min(bodyHits, 5);
  return titleWeight + headingWeight + bodyWeight;
}

export function search(index: Chunk[], query: string, limit = 12): Hit[] {
  if (!query) return [];
  const out: Hit[] = [];
  const seenLeads = new Set<string>();
  for (const c of index) {
    const score = scoreChunk(c, query);
    if (score <= 0) continue;
    const [section] = c.pageSlug.split("/");
    // For a title-only match we don't need the lead chunk and a section
    // chunk both showing up. Prefer the section chunk when both are tied
    // by collapsing the lead (anchor === "") if a section chunk for the
    // same page already qualifies.
    const key = `${c.pageSlug}::${c.sectionAnchor}`;
    if (seenLeads.has(key)) continue;
    seenLeads.add(key);
    out.push({
      pageTitle: c.pageTitle,
      pageSlug: c.pageSlug,
      sectionHeading: c.sectionHeading,
      sectionAnchor: c.sectionAnchor,
      section,
      snippet: makeSnippet(c.bodyText, query),
      score,
    });
  }
  // Sort by score, then collapse runs of same-page hits so the list isn't
  // dominated by one page. Keep at most three sections per page.
  out.sort((a, b) => b.score - a.score);
  const perPage = new Map<string, number>();
  const trimmed: Hit[] = [];
  for (const h of out) {
    const c = perPage.get(h.pageSlug) ?? 0;
    if (c >= 3) continue;
    perPage.set(h.pageSlug, c + 1);
    trimmed.push(h);
    if (trimmed.length >= limit) break;
  }
  return trimmed;
}
