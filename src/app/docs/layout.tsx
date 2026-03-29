import { DocsNav } from "@/components/docs-nav";
import { DocsMobileNav } from "@/components/docs-mobile-nav";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-5xl gap-12 px-6 py-16">
      <aside className="hidden w-48 shrink-0 lg:block">
        <div className="sticky top-20">
          <DocsNav />
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <DocsMobileNav />
        {children}
      </div>
    </div>
  );
}
