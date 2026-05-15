import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "Strings, XS Guide" };

export const headings: Heading[] = [
  { id: "basics", label: "Basics", level: 2 },
  { id: "interpolation", label: "Interpolation", level: 2 },
  { id: "format-specs", label: "Format specs", level: 2 },
  { id: "raw-strings", label: "Raw strings", level: 2 },
  { id: "triple-quoted", label: "Triple-quoted strings", level: 2 },
  { id: "color-strings", label: "Color strings", level: 2 },
  { id: "common-methods", label: "Common methods", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="guide" slug="strings" headings={headings}>
      <H1>Strings</H1>
      <Lead>
        Single and double quotes are identical. Both support interpolation,
        escape sequences, and all string methods.
      </Lead>

      <H2 id="basics">Basics</H2>

      <CodeBlock
        runnable
        code={`let s1 = "hello world"
let s2 = 'also a string'

-- concatenation
let joined = "hello" ++ " world"
println(joined)

-- length (codepoints, not bytes)
println("hello".len())           -- 5`}
      />

      <H2 id="interpolation">Interpolation</H2>

      <P>
        Any expression inside <code>{"{"}</code> braces gets evaluated and
        embedded in the string. Escape a brace with <code>\{"{"}</code> to
        suppress interpolation.
      </P>

      <CodeBlock
        runnable
        code={`let name = "XS"
println("Hello, {name}!")        -- Hello, XS!
println("{1 + 2} is three")      -- 3 is three
println("len: {name.len()}")     -- len: 2
println("\\{literal brace}")      -- {literal brace}`}
      />

      <H2 id="format-specs">Format specs</H2>

      <P>
        Add <code>:spec</code> after an interpolated expression to control
        formatting. The spec follows Python{"'"}s mini-language:{" "}
        <code>{"[fill][align][width][,][.prec][type]"}</code>.
      </P>

      <CodeBlock
        runnable
        code={`let pi = 3.14159
println("{pi:.2}")               -- 3.14
println("{pi:8.2}")              --     3.14
println("{pi:<8.2}")             -- 3.14
println("{pi:^8.2}")             --   3.14
println("{pi:.2%}")              -- 314.16%

let n = 1234567
println("{n:,}")                 -- 1,234,567
println("{255:x}")               -- ff
println("{8:b}")                 -- 1000
println("{42:0>5}")              -- 00042`}
      />

      <H2 id="raw-strings">Raw strings</H2>

      <P>
        Prefix <code>r</code> to disable escape processing and interpolation.
        Useful for regex patterns and file paths.
      </P>

      <CodeBlock
        runnable
        code={`let pattern = r"\\d+\\.\\d+"
println(pattern)                 -- \\d+\\.\\d+

let x = 42
let raw = r"no {x} here \\n raw"
println(raw)                     -- no {x} here \\n raw`}
      />

      <H2 id="triple-quoted">Triple-quoted strings</H2>

      <P>
        Use <code>{"\"\"\" \"\"\""}</code> for multi-line strings. Indentation
        is preserved and interpolation still works. Prefix with <code>r</code>{" "}
        for raw triple-quoted.
      </P>

      <CodeBlock
        runnable
        code={`let text = """
  line one
  line two
  line three
"""
println(text.contains("line two"))   -- true`}
      />

      <H2 id="color-strings">Color strings</H2>

      <P>
        Prefix <code>c</code> to embed ANSI terminal colors at parse time. The
        format is <code>{"c\"style;style;...;text\""}</code> where the last
        segment is the text.
      </P>

      <CodeBlock
        code={`let err = c"bold;red;Error: something went wrong"
let ok  = c"green;Done"
println(err)
println(ok)`}
        noRun
      />

      <Note>
        Color strings work in the terminal. The playground strips ANSI codes,
        so this snippet is marked non-runnable there.
      </Note>

      <H2 id="common-methods">Common methods</H2>

      <CodeBlock
        runnable
        code={`let s = "Hello, World!"

println(s.upper())               -- HELLO, WORLD!
println(s.lower())               -- hello, world!
println(s.contains("World"))     -- true
println(s.starts_with("Hello"))  -- true
println(s.replace("World", "XS")) -- Hello, XS!
println(s.split(", "))           -- [Hello, World!]
println("  hi  ".trim())         -- hi
println("ha".repeat(3))          -- hahaha
println(s.slice(0, 5))           -- Hello`}
      />
    </DocLayout>
  );
}
