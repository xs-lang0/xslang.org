// Parse anything the user might paste into the gist-import dialog and
// return the gist's 32-hex ID, or null if the input doesn't look like
// any of the accepted forms.
//
// Accepted:
//   - bare ID: "abc123..."  (20+ hex chars; GitHub uses 32 but older
//     IDs were shorter, so be lenient)
//   - https://gist.github.com/user/<id>
//   - https://gist.github.com/<id>
//   - any of the above with a trailing /raw, /revisions, /<sha>, ...
export function parseGistRef(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  // Bare ID
  const bare = s.match(/^[0-9a-fA-F]{20,}$/);
  if (bare) return s.toLowerCase();
  // Find the longest hex chunk in the URL; that's the ID.
  const ids = s.match(/[0-9a-fA-F]{20,}/g);
  if (!ids) return null;
  return ids[ids.length - 1].toLowerCase();
}

type GistFile = {
  filename?: string;
  truncated?: boolean;
  content?: string;
  raw_url?: string;
};

type GistResponse = {
  files?: Record<string, GistFile>;
};

// Fetch the gist via the public API and return a name->content map of
// every .xs file in it. Truncated files (gist payload > 1 MB) are
// re-fetched via the raw_url. Throws an Error with a user-readable
// message on any HTTP failure.
export async function fetchGist(id: string): Promise<Record<string, string>> {
  const res = await fetch(`https://api.github.com/gists/${encodeURIComponent(id)}`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error("gist not found (or private)");
    if (res.status === 403) throw new Error("github rate limit hit, try again later");
    throw new Error(`github responded ${res.status}`);
  }
  const data: GistResponse = await res.json();
  const files = data.files ?? {};
  const out: Record<string, string> = {};
  for (const [name, file] of Object.entries(files)) {
    if (!name.endsWith(".xs")) continue;
    let content = file.content ?? "";
    if (file.truncated && file.raw_url) {
      try {
        const raw = await fetch(file.raw_url);
        if (raw.ok) content = await raw.text();
      } catch { /* keep the truncated content */ }
    }
    out[name] = content;
  }
  return out;
}
