import type { ReactNode } from "react";
import { DocSidebar } from "./doc-sidebar";
import { DocTOC } from "./doc-toc";
import { EditOnGitHub } from "./edit-on-github";
import type { Heading } from "@/lib/headings";

export function DocLayout({
  section,
  slug,
  headings = [],
  children,
}: {
  section: string;
  slug: string;
  headings?: Heading[];
  children: ReactNode;
}) {
  const filePath = `src/app/docs/${section}/${slug}/page.tsx`;
  return (
    <div className="mx-auto max-w-[1180px] px-7 py-10 grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)_220px]">
      <aside className="hidden lg:block sticky top-6 self-start max-h-[calc(100vh-3rem)] overflow-y-auto">
        <DocSidebar />
      </aside>
      <article className="min-w-0">
        {children}
        <EditOnGitHub path={filePath} />
      </article>
      <aside className="hidden lg:block sticky top-6 self-start">
        <DocTOC headings={headings} />
      </aside>
    </div>
  );
}
