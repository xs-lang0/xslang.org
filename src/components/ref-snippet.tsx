import { readFileSync } from "fs";
import { join } from "path";

let cache: Record<string, string> | null = null;
function load(): Record<string, string> {
  if (cache) return cache;
  try {
    cache = JSON.parse(readFileSync(join(process.cwd(), "public", "refsnips.json"), "utf8"));
    return cache!;
  } catch {
    cache = {};
    return cache;
  }
}

export function RefSnippet({ slug }: { slug: string }) {
  const all = load();
  const md = all[slug];
  if (!md) {
    return (
      <aside className="my-6 border-l-2 border-[color:var(--text-faint)] bg-[color:var(--panel)] px-4 py-3 text-sm text-[color:var(--text-muted)] font-mono">
        canonical excerpt unavailable (build-docs could not reach xsypy)
      </aside>
    );
  }
  return (
    <pre className="my-6 rounded-[6px] border border-[color:var(--rule)] bg-[color:var(--panel)] p-4 text-[13px] leading-[1.65] text-[color:var(--text)] overflow-x-auto whitespace-pre-wrap">
      {md.trim()}
    </pre>
  );
}
