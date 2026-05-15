import type { ReactNode } from "react";
import { CodeBlock } from "@/components/code-block";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function renderInline(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let i = 0;
  let plain = "";
  let key = 0;

  const flush = () => { if (plain) { parts.push(plain); plain = ""; } };

  while (i < text.length) {
    if (text[i] === "[") {
      const labelEnd = text.indexOf("]", i);
      if (labelEnd !== -1 && text[labelEnd + 1] === "(") {
        const urlEnd = text.indexOf(")", labelEnd + 2);
        if (urlEnd !== -1) {
          flush();
          const label = text.slice(i + 1, labelEnd);
          const url = text.slice(labelEnd + 2, urlEnd);
          parts.push(<a key={key++} href={url}>{label}</a>);
          i = urlEnd + 1;
          continue;
        }
      }
    }
    if (text[i] === "`") {
      const end = text.indexOf("`", i + 1);
      if (end !== -1) {
        flush();
        parts.push(
          <code key={key++} style={{
            background: "var(--panel)",
            padding: "1px 6px",
            borderRadius: 3,
            fontSize: "0.86em",
            color: "var(--text)",
            fontFamily: "var(--mono)",
            overflowWrap: "anywhere",
            wordBreak: "break-word",
          }}>{text.slice(i + 1, end)}</code>
        );
        i = end + 1;
        continue;
      }
    }
    if (text[i] === "*" && text[i + 1] === "*") {
      const end = text.indexOf("**", i + 2);
      if (end !== -1) {
        flush();
        parts.push(<strong key={key++}>{text.slice(i + 2, end)}</strong>);
        i = end + 2;
        continue;
      }
    }
    if (text[i] === "*" && text[i + 1] !== "*") {
      const end = text.indexOf("*", i + 1);
      if (end !== -1) {
        flush();
        parts.push(<em key={key++}>{text.slice(i + 1, end)}</em>);
        i = end + 1;
        continue;
      }
    }
    plain += text[i];
    i++;
  }
  flush();
  return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : <>{parts}</>;
}

type MdBlock =
  | { type: "h1" | "h2" | "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "code"; lang: string; body: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "hr" }
  | { type: "blank" };

function parseMd(src: string): MdBlock[] {
  const lines = src.split("\n");
  const blocks: MdBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const bodyLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        bodyLines.push(lines[i]);
        i++;
      }
      i++;
      blocks.push({ type: "code", lang, body: bodyLines.join("\n") });
      continue;
    }

    const h3 = line.match(/^###\s+(.*)/);
    if (h3) { blocks.push({ type: "h3", text: h3[1] }); i++; continue; }
    const h2 = line.match(/^##\s+(.*)/);
    if (h2) { blocks.push({ type: "h2", text: h2[1] }); i++; continue; }
    const h1 = line.match(/^#\s+(.*)/);
    if (h1) { blocks.push({ type: "h1", text: h1[1] }); i++; continue; }

    if (/^[-*]{3,}$/.test(line.trim())) { blocks.push({ type: "hr" }); i++; continue; }

    if (line.trim() === "") { blocks.push({ type: "blank" }); i++; continue; }

    if (line.includes("|") && i + 1 < lines.length && lines[i + 1].match(/^\s*\|?\s*[-:]+/)) {
      const parseRow = (l: string) =>
        l.replace(/^\||\|$/g, "").split("|").map(c => c.trim());
      const head = parseRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim() !== "") {
        rows.push(parseRow(lines[i]));
        i++;
      }
      blocks.push({ type: "table", head, rows });
      continue;
    }

    if (/^[-*]\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    const paraStart = i;
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("```") &&
      !lines[i].startsWith("#") &&
      !/^[-*]\s/.test(lines[i]) &&
      !/^\d+\.\s/.test(lines[i]) &&
      !/^[-*]{3,}$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: "p", text: paraLines.join(" ") });
    } else if (i === paraStart) {
      i++;
    }
  }

  return blocks;
}

function renderBlocks(blocks: MdBlock[], compact: boolean): ReactNode[] {
  const out: ReactNode[] = [];
  let listBuf: { type: "ul" | "ol"; items: string[] } | null = null;
  let idx = 0;

  const flushList = () => {
    if (!listBuf) return;
    const Tag = listBuf.type === "ul" ? "ul" : "ol";
    const cls = listBuf.type === "ul"
      ? "list-disc pl-6 mb-4 text-[15.5px] leading-[1.7] text-[color:var(--text)] space-y-1.5 max-w-full break-words"
      : "list-decimal pl-6 mb-4 text-[15.5px] leading-[1.7] text-[color:var(--text)] space-y-1.5 max-w-full break-words";
    out.push(
      <Tag key={idx++} className={cls} style={{ overflowWrap: "anywhere" }}>
        {listBuf.items.map((item, j) => (
          <li key={j} className="max-w-full break-words" style={{ overflowWrap: "anywhere" }}>{renderInline(item)}</li>
        ))}
      </Tag>
    );
    listBuf = null;
  };

  for (const block of blocks) {
    if (block.type === "blank") { flushList(); continue; }

    if (block.type === "ul" || block.type === "ol") {
      if (listBuf && listBuf.type === block.type) {
        listBuf.items.push(...block.items);
      } else {
        flushList();
        listBuf = { type: block.type, items: [...block.items] } as { type: "ul" | "ol"; items: string[] };
      }
      continue;
    }

    flushList();

    if (block.type === "h1" || block.type === "h2") {
      out.push(
        <h2 key={idx++} id={slugify(block.text)}
          className={compact
            ? "text-[16px] font-semibold tracking-tight text-[color:var(--text)] mt-5 mb-2"
            : "text-[22px] font-semibold tracking-tight text-[color:var(--text)] mt-12 mb-3 pt-3 border-t border-[color:var(--rule-soft)]"}>
          {renderInline(block.text)}
        </h2>
      );
    } else if (block.type === "h3") {
      out.push(
        <h3 key={idx++} id={slugify(block.text)}
          className={compact
            ? "text-[14px] font-semibold tracking-tight text-[color:var(--text-muted)] mt-4 mb-1.5 uppercase tracking-[0.06em]"
            : "text-[17px] font-semibold tracking-tight text-[color:var(--text)] mt-8 mb-2"}>
          {renderInline(block.text)}
        </h3>
      );
    } else if (block.type === "p") {
      out.push(
        <p key={idx++} className="text-[15px] leading-[1.7] text-[color:var(--text)] mb-3 max-w-full break-words">
          {renderInline(block.text)}
        </p>
      );
    } else if (block.type === "code") {
      out.push(<CodeBlock key={idx++} code={block.body} />);
    } else if (block.type === "table") {
      out.push(
        <div key={idx++} className="my-6 overflow-x-auto">
          <table className="w-full text-[14px] border-collapse">
            <thead>
              <tr>
                {block.head.map((h, j) => (
                  <th key={j}
                    className="text-left px-3 py-2 border-b border-[color:var(--rule)] font-semibold text-[color:var(--text-muted)] uppercase tracking-[0.05em] text-[11px]">
                    {renderInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? "" : "bg-[color:var(--panel)]"}>
                  {row.map((cell, ci) => (
                    <td key={ci}
                      className="px-3 py-2 border-b border-[color:var(--rule-soft)] text-[color:var(--text)]">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (block.type === "hr") {
      out.push(<hr key={idx++} className="my-8 border-[color:var(--rule)]" />);
    }
  }

  flushList();
  return out;
}

export function Markdown({ source, className, compact = false }: { source: string; className?: string; compact?: boolean }) {
  const blocks = parseMd(source.trim());
  return <div className={className}>{renderBlocks(blocks, compact)}</div>;
}
