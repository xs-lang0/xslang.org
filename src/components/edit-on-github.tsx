export function EditOnGitHub({ path }: { path: string }) {
  const url = `https://github.com/xs-lang0/xslang.org/edit/main/${path}`;
  return (
    <div className="mt-12 pt-6 border-t border-[color:var(--rule-soft)] text-sm">
      <a href={url} target="_blank" rel="noopener noreferrer">Edit this page on GitHub -&gt;</a>
    </div>
  );
}
