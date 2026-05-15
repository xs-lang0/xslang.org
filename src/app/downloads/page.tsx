import { Wrap } from "@/components/wrap";
import { CopyButton } from "@/components/copy-button";
import { Markdown } from "@/components/markdown";
import { H1, H2, P } from "@/components/prose";
import { fetchReleases, type Asset } from "@/lib/releases";

export const metadata = { title: "Downloads, XS" };
export const revalidate = 300;

const PLATFORM_LABEL: Record<string, string> = {
  "macos-arm64": "macOS, arm64",
  "macos-x64": "macOS, x64",
  "linux-x64": "Linux, x64",
  "linux-arm64": "Linux, arm64",
  "windows-x64": "Windows, x64",
};

function DownloadRow({ label, asset }: { label: string; asset: Asset }) {
  const sizeMb = (asset.size / 1024 / 1024).toFixed(1);
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[6px] border border-[color:var(--rule)] bg-[color:var(--panel)] px-[14px] py-[11px] font-mono text-[13px]">
      <span className="w-[120px] shrink-0 text-[11px] uppercase tracking-[0.06em] text-[color:var(--text-faint)]">{label}</span>
      <span className="flex-1 overflow-x-auto whitespace-nowrap text-[color:var(--text)]">
        {asset.name} <span className="text-[color:var(--text-faint)]">({sizeMb} MB)</span>
      </span>
      {asset.sha256Url && (
        <a
          href={asset.sha256Url}
          className="no-rule font-mono text-[11px] uppercase tracking-[0.06em] text-[color:var(--text-faint)] hover:text-[color:var(--link)] transition-colors"
        >
          sha256
        </a>
      )}
      <CopyButton text={asset.url} />
      <a
        href={asset.url}
        download
        className="no-rule inline-flex items-center font-mono text-[11px] uppercase tracking-[0.06em] font-medium text-[color:var(--bg)] bg-[color:var(--link)] hover:bg-[color:var(--link-hover)] transition-colors px-3 py-1 rounded-[4px]"
      >
        download
      </a>
    </div>
  );
}

export default async function DownloadsPage() {
  const releases = await fetchReleases();
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
                return <DownloadRow key={p} label={PLATFORM_LABEL[p]} asset={a} />;
              })}
            </div>
          </>
        ) : (
          <P>Could not reach the GitHub releases API just now. Refresh in a minute.</P>
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
            {r.body ? <div className="overflow-hidden"><Markdown source={r.body} compact /></div> : <p className="text-[color:var(--text-muted)]">no notes</p>}
          </div>
        ))}
        {releases.length > 20 && (
          <details className="mt-8">
            <summary className="cursor-pointer text-[color:var(--link)]">show older releases</summary>
            {releases.slice(20).map(r => (
              <div key={r.tag} className="border-t border-[color:var(--rule-soft)] pt-5 mt-7">
                <h3 className="text-[17px] font-semibold tracking-tight">{r.tag}</h3>
                <p className="font-mono text-xs text-[color:var(--text-faint)] mb-3">{new Date(r.published).toISOString().slice(0, 10)}</p>
                {r.body && <div className="overflow-hidden"><Markdown source={r.body} compact /></div>}
              </div>
            ))}
          </details>
        )}
      </section>
    </Wrap>
  );
}
