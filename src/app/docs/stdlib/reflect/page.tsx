import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "reflect, XS Stdlib · XS Docs" },
  description: "Runtime type inspection for structs, classes, and arbitrary values.",
};

export const headings: Heading[] = [
  { id: "import", label: "Import", level: 2 },
  { id: "functions", label: "Functions", level: 2 },
  { id: "examples", label: "Examples", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="stdlib" slug="reflect" headings={headings}>
      <H1>reflect</H1>
      <Lead>Runtime type inspection for structs, classes, and arbitrary values.</Lead>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import reflect`} />

      <H2 id="functions">Functions</H2>

      <H3 id="fn-type-of">{`reflect.type_of(val: any) -> str`}</H3>
      <P>Return the type name of a value as a string.</P>

      <H3 id="fn-fields">{`reflect.fields(val: any) -> [str]`}</H3>
      <P>Return the field names of a struct or class instance.</P>

      <H3 id="fn-methods">{`reflect.methods(val: any) -> [str]`}</H3>
      <P>Return the method names of a struct or class instance.</P>

      <H3 id="fn-is-instance">{`reflect.is_instance(val: any, type: any) -> bool`}</H3>
      <P>Check if a value is an instance of a given type.</P>

      <H2 id="examples">Examples</H2>
      <CodeBlock
        runnable
        code={`import reflect

println(reflect.type_of(42))         -- int
println(reflect.type_of("hello"))    -- str
println(reflect.type_of([1,2,3]))    -- array
println(reflect.type_of(#{}))        -- map

struct Point { x: int, y: int }
let p = Point { x: 1, y: 2 }
println(reflect.type_of(p))          -- Point
println(reflect.fields(p))           -- [x, y]`}
      />
    </DocLayout>
  );
}
