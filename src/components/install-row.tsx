import { CopyButton } from "./copy-button";

export function InstallRow({
  platform,
  prompt = "$",
  cmd,
  copyText,
  primary = false,
}: {
  platform: string;
  prompt?: string;
  cmd: string;
  copyText?: string;
  primary?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[6px] border border-[color:var(--rule)] bg-[color:var(--panel)] px-[14px] py-[11px] font-mono text-[13px]">
      <span className="w-[76px] shrink-0 text-[11px] uppercase tracking-[0.06em] text-[color:var(--text-faint)]">{platform}</span>
      <span className="select-none text-[color:var(--num)]">{prompt}</span>
      <span className="flex-1 overflow-x-auto whitespace-nowrap text-[color:var(--text)]">
        {cmd}
        {primary && <span className="ml-0.5 animate-pulse text-[color:var(--link)]">|</span>}
      </span>
      <CopyButton text={copyText ?? cmd} className="shrink-0" />
    </div>
  );
}
