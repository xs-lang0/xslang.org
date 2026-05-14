import { readFileSync } from "fs";
import { join } from "path";
import { Wrap } from "@/components/wrap";
import { InstallRow } from "@/components/install-row";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, P } from "@/components/prose";

export const metadata = { title: "Downloads, XS" };

type Asset = { platform: string; name: string; url: string; size: number; sha256Url?: string };
type Release = { tag: string; name: string; published: string; body: string; assets: Asset[] };

function loadReleases(): Release[] {
  try {
    const raw = readFileSync(join(process.cwd(), "public", "releases.json"), "utf8");
    return JSON.parse(raw) as Release[];
  } catch {
    return [];
  }
}

const PLATFORM_LABEL: Record<string, string> = {
  "macos-arm64": "macOS, arm64",
  "macos-x64": "macOS, x64",
  "linux-x64": "Linux, x64",
  "linux-arm64": "Linux, arm64",
  "windows-x64": "Windows, x64",
};

export default function DownloadsPage() {
  const releases = loadReleases();
  const latest = releases[0];

  return (
    <Wrap>
      <section className="pt-14 pb-12">
        <H1>Downloads</H1>
        {latest ? (
          <>
            <P>
              Latest: <code>{latest.tag}</code>, published {new Date(latest.published).toISOString().slice(0, 10)}.
            </P>
            <div className="flex flex-col gap-1.5 my-7">
              {Object.keys(PLATFORM_LABEL).map(p => {
                const a = latest.assets.find(x => x.platform === p);
                if (!a) return null;
                return (
                  <InstallRow
                    key={p}
                    platform={PLATFORM_LABEL[p]}
                    prompt="v"
                    cmd={`${a.name} (${(a.size / 1024 / 1024).toFixed(1)} MB)`}
                    copyText={a.url}
                  />
                );
              })}
            </div>
          </>
        ) : (
          <P>Release info will appear once the build finishes fetching.</P>
        )}

        <H2 id="verify">Verify</H2>
        <P>
          Each release includes a SHA-256 sum file alongside the binary. Run <code>shasum -a 256 -c xs-{"<platform>"}.tar.gz.sha256</code> after downloading.
        </P>

        <H2 id="changelog">Changelog</H2>
        {releases.slice(0, 20).map(r => (
          <div key={r.tag} className="border-t border-[color:var(--rule-soft)] pt-5 mt-7">
            <h3 className="text-[17px] font-semibold tracking-tight">{r.tag}</h3>
            <p className="font-mono text-xs text-[color:var(--text-faint)] mb-3">{new Date(r.published).toISOString().slice(0, 10)}</p>
            {r.body ? <CodeBlock code={r.body} /> : <p className="text-[color:var(--text-muted)]">no notes</p>}
          </div>
        ))}
        {releases.length > 20 && (
          <details className="mt-8">
            <summary className="cursor-pointer text-[color:var(--link)]">show older releases</summary>
            {releases.slice(20).map(r => (
              <div key={r.tag} className="border-t border-[color:var(--rule-soft)] pt-5 mt-7">
                <h3 className="text-[17px] font-semibold tracking-tight">{r.tag}</h3>
                <p className="font-mono text-xs text-[color:var(--text-faint)] mb-3">{new Date(r.published).toISOString().slice(0, 10)}</p>
                {r.body && <CodeBlock code={r.body} />}
              </div>
            ))}
          </details>
        )}
      </section>
    </Wrap>
  );
}
