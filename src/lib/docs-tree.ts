export type DocPage = { slug: string; label: string };
export type DocSection = { id: string; label: string; pages: DocPage[] };

export const docsTree: DocSection[] = [
  {
    id: "guide",
    label: "Guide",
    pages: [
      { slug: "installation", label: "Installation" },
      { slug: "introduction", label: "Introduction" },
      { slug: "first-program", label: "Your first program" },
      { slug: "variables", label: "Variables and bindings" },
      { slug: "operators", label: "Operators and arithmetic" },
      { slug: "strings", label: "Strings" },
      { slug: "collections", label: "Collections" },
      { slug: "control-flow", label: "Control flow" },
      { slug: "functions", label: "Functions and closures" },
      { slug: "pattern-matching", label: "Pattern matching" },
      { slug: "structs", label: "Structs and impl" },
      { slug: "enums", label: "Enums" },
      { slug: "classes-traits", label: "Classes and traits" },
      { slug: "type-system", label: "Type system" },
      { slug: "error-handling", label: "Error handling" },
      { slug: "effects", label: "Effects" },
      { slug: "concurrency", label: "Concurrency" },
      { slug: "reactive", label: "Reactive bindings and contracts" },
      { slug: "duration", label: "Duration and temporal" },
      { slug: "decorators", label: "Decorators" },
      { slug: "modules", label: "Modules and packages" },
      { slug: "testing", label: "Testing" },
    ],
  },
  {
    id: "reference",
    label: "Reference",
    pages: [
      { slug: "lexical", label: "Lexical structure" },
      { slug: "variables", label: "Variables" },
      { slug: "data-types", label: "Data types" },
      { slug: "numeric-literals", label: "Numeric literals" },
      { slug: "strings", label: "Strings" },
      { slug: "string-methods", label: "String methods" },
      { slug: "arrays", label: "Arrays" },
      { slug: "tuples", label: "Tuples" },
      { slug: "maps", label: "Maps" },
      { slug: "ranges", label: "Ranges" },
      { slug: "regex", label: "Regex" },
      { slug: "operators", label: "Operators" },
      { slug: "numeric-behavior", label: "Numeric behavior" },
      { slug: "control-flow", label: "Control flow" },
      { slug: "pattern-matching", label: "Pattern matching" },
      { slug: "functions", label: "Functions" },
      { slug: "generators", label: "Generators" },
      { slug: "tagged-blocks", label: "Tagged blocks" },
      { slug: "structs", label: "Structs" },
      { slug: "enums", label: "Enums" },
      { slug: "traits", label: "Traits" },
      { slug: "classes", label: "Classes" },
      { slug: "type-system", label: "Type system" },
      { slug: "error-handling", label: "Error handling" },
      { slug: "unsafe", label: "Unsafe blocks" },
      { slug: "reactive", label: "Reactive bindings" },
      { slug: "effects", label: "Algebraic effects" },
      { slug: "concurrency", label: "Concurrency" },
      { slug: "modules", label: "Modules and imports" },
      { slug: "comprehensions", label: "Comprehensions and spread" },
      { slug: "builtins", label: "Built-in functions" },
      { slug: "number-methods", label: "Number methods" },
      { slug: "duration", label: "Duration" },
      { slug: "temporal", label: "Temporal primitives" },
      { slug: "decorators", label: "Decorators" },
      { slug: "backends", label: "Execution backends" },
      { slug: "cli", label: "CLI reference" },
      { slug: "plugins", label: "Plugin system" },
    ],
  },
  {
    id: "stdlib",
    label: "Stdlib",
    pages: [
      "async","base64","buf","cli","collections","crypto","csv","db","encode","ffi",
      "fmt","fs","gc","hash","http","io","json","log","math","msgpack","net","os",
      "path","process","promise","random","re","reflect","string","test","thread",
      "time","toml","tracing","url","uuid",
    ].map(s => ({ slug: s, label: s })),
  },
];

export function adjacent(currentSection: string, currentSlug: string) {
  const flat: { section: string; slug: string; label: string }[] = [];
  for (const s of docsTree) for (const p of s.pages) flat.push({ section: s.id, slug: p.slug, label: p.label });
  const i = flat.findIndex(p => p.section === currentSection && p.slug === currentSlug);
  return { prev: flat[i - 1], next: flat[i + 1] };
}
