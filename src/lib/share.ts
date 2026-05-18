// Encoding / decoding for the playground's #s= share fragment and the
// /embed route's ?code= query. The format carries the whole workspace
// (files + which one was active) instead of just one snippet, so a
// paste-link reproduces what the sharer was looking at.
//
// Layout of an encoded value:
//   "1" + base64url( deflate-raw( JSON.stringify({f, a}) ) )
// where f is { name: content } and a is the active filename. The leading
// "1" is a single-byte version marker; future shape changes pick "2",
// "3" and the decoder can branch.
//
// Legacy (no version byte, raw base64 of a UTF-8 source) is still accepted
// by decodeShare so links shared before this change still open.

export type Workspace = {
  files: Record<string, string>;
  active: string;
};

const V1 = "1";

// CompressionStream is widely available, but a few WebViews / SSR contexts
// still lack it. When that happens, fall back to uncompressed JSON with a
// "0" marker so encode never throws.
const V0 = "0";

function b64urlEncode(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Uint8Array {
  let b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function streamThrough(input: Uint8Array, transform: GenericTransformStream): Promise<Uint8Array> {
  // Round-trip through a Response so we can use the platform's stream
  // plumbing instead of writing our own controller. The blob copy is the
  // cheapest way to turn a Uint8Array into a ReadableStream.
  const body = new Response(new Blob([input as unknown as BlobPart])).body;
  if (!body) throw new Error("ReadableStream unavailable");
  const stream = body.pipeThrough(transform as unknown as ReadableWritablePair<Uint8Array, Uint8Array>);
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.length;
  }
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) { out.set(c, off); off += c.length; }
  return out;
}

function hasCompression(): boolean {
  return typeof CompressionStream !== "undefined" && typeof DecompressionStream !== "undefined";
}

// Encode a workspace to a URL-safe string. Always async because the gzip
// path is async; the no-gzip fallback awaits anyway for shape parity.
export async function encodeWorkspace(ws: Workspace): Promise<string> {
  const json = JSON.stringify({ f: ws.files, a: ws.active });
  const utf8 = new TextEncoder().encode(json);
  if (!hasCompression()) {
    return V0 + b64urlEncode(utf8);
  }
  try {
    const deflated = await streamThrough(utf8, new CompressionStream("deflate-raw"));
    return V1 + b64urlEncode(deflated);
  } catch {
    return V0 + b64urlEncode(utf8);
  }
}

// Decode a workspace from a share string. Returns null if the input isn't
// recognisable as either a versioned or a legacy single-file blob.
export async function decodeWorkspace(s: string): Promise<Workspace | null> {
  if (!s) return null;
  const tag = s[0];
  const rest = s.slice(1);

  if (tag === V1) {
    if (!hasCompression()) return null;
    try {
      const raw = b64urlDecode(rest);
      const inflated = await streamThrough(raw, new DecompressionStream("deflate-raw"));
      const json = new TextDecoder().decode(inflated);
      return parseWorkspace(json);
    } catch {
      return null;
    }
  }

  if (tag === V0) {
    try {
      const raw = b64urlDecode(rest);
      const json = new TextDecoder().decode(raw);
      return parseWorkspace(json);
    } catch {
      return null;
    }
  }

  // Legacy: pre-versioning, the whole string was a base64-url encoding of
  // one file's UTF-8 source. The leading byte is whatever the base64
  // alphabet happened to produce, so we can't distinguish it from a future
  // version tag except by trying and seeing if it round-trips to text.
  const single = decodeLegacySingle(s);
  if (single !== null) {
    return { files: { "shared.xs": single }, active: "shared.xs" };
  }
  return null;
}

function parseWorkspace(json: string): Workspace | null {
  try {
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== "object") return null;
    const f = parsed.f;
    const a = parsed.a;
    if (!f || typeof f !== "object") return null;
    if (typeof a !== "string") return null;
    const files: Record<string, string> = {};
    for (const [k, v] of Object.entries(f)) {
      if (typeof k === "string" && typeof v === "string") files[k] = v;
    }
    if (Object.keys(files).length === 0) return null;
    const active = a in files ? a : Object.keys(files)[0];
    return { files, active };
  } catch {
    return null;
  }
}

// Pre-versioning encoder: raw base64-url of the source. Returning null on
// failure lets the caller report "this isn't a share link" instead of
// silently producing garbage.
export function decodeLegacySingle(s: string): string | null {
  try {
    let b64 = s.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    // Quick sanity: legacy payloads were always source code. If it parses
    // as our JSON workspace shape, that's a v0/v1 payload and the caller
    // should not fall through here.
    if (text.startsWith("{") && /"f"\s*:/.test(text)) return null;
    return text;
  } catch {
    return null;
  }
}

// Rough byte length of an encoded payload before it goes into a URL. Used
// by the share UI to warn about big workspaces.
export function encodedSize(s: string): number {
  return s.length;
}
