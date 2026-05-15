import { readFileSync } from "fs";
import { join } from "path";
import { Markdown } from "@/components/markdown";

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
  return <Markdown source={md} className="ref-snippet my-4" />;
}
