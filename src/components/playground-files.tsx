"use client";

type Props = {
  files: Record<string, string>;
  activeFile: string;
  onSelect: (name: string) => void;
  onNewBlank: () => void;
  onDelete: (name: string) => void;
};

export function PlaygroundFiles({ files, activeFile, onSelect, onNewBlank, onDelete }: Props) {
  const fileNames = Object.keys(files).sort();
  const onlyFile = fileNames.length === 1;
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto py-1 px-1">
        {fileNames.map(name => {
          const active = name === activeFile;
          return (
            <div
              key={name}
              className={
                "group flex items-stretch text-[12.5px] font-mono " +
                (active
                  ? "text-[color:var(--text)] bg-[color:var(--rule-soft)]"
                  : "text-[color:var(--text-muted)] hover:bg-[color:var(--rule-soft)] hover:text-[color:var(--text)]")
              }
            >
              <button onClick={() => onSelect(name)} className="flex-1 text-left px-3 py-1 truncate cursor-pointer">
                {name}
              </button>
              <button
                onClick={() => onDelete(name)}
                disabled={onlyFile}
                className="px-2 opacity-0 group-hover:opacity-100 disabled:hidden hover:text-[color:var(--kw)] transition-opacity"
                title={onlyFile ? "" : "delete " + name}
                aria-label={"delete " + name}
              >×</button>
            </div>
          );
        })}
      </div>
      <button
        onClick={onNewBlank}
        className="border-t border-[color:var(--rule)] py-1.5 text-[12px] font-mono text-[color:var(--text-faint)] hover:text-[color:var(--text)] transition-colors"
      >+ new file</button>
    </div>
  );
}
