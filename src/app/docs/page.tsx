import Link from "next/link";
import { Wrap } from "@/components/wrap";
import { H1, Lead } from "@/components/prose";

const CARDS = [
  { id: "guide", title: "Guide", desc: "Read top to bottom to learn XS. Tutorials and topical chapters.", first: "installation" },
  { id: "reference", title: "Reference", desc: "The formal language reference, mirroring LANGUAGE.md.", first: "lexical" },
  { id: "stdlib", title: "Stdlib", desc: "One page per standard library module.", first: "math" },
];

export const metadata = {
  title: "Docs",
  description: "Three sections. Read the Guide first if you are new. Reference and Stdlib are organised for lookup once you know what you are looking for. Cmd-K opens search anywhere on the site.",
};

export default function DocsLanding() {
  return (
    <Wrap>
      <section className="pt-14 pb-12">
        <H1>Documentation</H1>
        <Lead>
          Three sections. Read the Guide first if you are new. Reference and Stdlib are organised for lookup once you know what you are looking for. Cmd-K opens search anywhere on the site.
        </Lead>
        <div className="grid gap-4 md:grid-cols-3 mt-10">
          {CARDS.map(c => (
            <Link
              key={c.id}
              href={`/docs/${c.id}/${c.first}`}
              className="no-rule block border border-[color:var(--rule)] rounded-[6px] p-5 hover:border-[color:var(--link)] transition-colors"
            >
              <div className="font-mono text-xs uppercase tracking-[0.06em] text-[color:var(--text-faint)] mb-1.5">{c.id}</div>
              <h2 className="text-lg font-semibold text-[color:var(--text)] mb-1.5">{c.title}</h2>
              <p className="text-sm text-[color:var(--text-muted)]">{c.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </Wrap>
  );
}
