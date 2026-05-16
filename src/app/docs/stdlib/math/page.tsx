import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P, UL } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "math, XS Stdlib · XS Docs" },
  description: "Numeric functions and constants for scientific and general-purpose computation.",
};

export const headings: Heading[] = [
  { id: "import", label: "Import", level: 2 },
  { id: "constants", label: "Constants", level: 2 },
  { id: "functions", label: "Functions", level: 2 },
  { id: "examples", label: "Examples", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="stdlib" slug="math" headings={headings}>
      <H1>math</H1>
      <Lead>Numeric functions and constants for scientific and general-purpose computation.</Lead>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import math`} />

      <H2 id="constants">Constants</H2>
      <P>
        <code>math.PI</code> / <code>math.pi</code> - pi (3.14159...){" "}
        <br />
        <code>math.E</code> / <code>math.e</code> - Euler's number{" "}
        <br />
        <code>math.TAU</code> / <code>math.tau</code> - 2 * pi{" "}
        <br />
        <code>math.INF</code> / <code>math.inf</code> - positive infinity{" "}
        <br />
        <code>math.NAN</code> / <code>math.nan</code> - not-a-number
      </P>

      <H2 id="functions">Functions</H2>

      <H3 id="fn-trig">Trigonometry</H3>
      <P>
        <code>sin</code>, <code>cos</code>, <code>tan</code>, <code>asin</code>,{" "}
        <code>acos</code>, <code>atan</code>, <code>atan2(y, x)</code>,{" "}
        <code>sinh</code>, <code>cosh</code>, <code>tanh</code>,{" "}
        <code>asinh</code>, <code>acosh</code>, <code>atanh</code> - standard trig and hyperbolic functions.
      </P>

      <H3 id="fn-exp">Exponents and logarithms</H3>
      <P>
        <code>sqrt(x)</code>, <code>cbrt(x)</code>, <code>exp(x)</code>,{" "}
        <code>expm1(x)</code>, <code>log(x)</code>, <code>log2(x)</code>,{" "}
        <code>log10(x)</code>, <code>log1p(x)</code>
      </P>

      <H3 id="fn-round">Rounding</H3>
      <P>
        <code>floor(x)</code>, <code>ceil(x)</code>, <code>round(x)</code>,{" "}
        <code>trunc(x)</code>
      </P>

      <H3 id="fn-util">Utility</H3>
      <UL>
        <li><code>abs(x)</code> - absolute value</li>
        <li><code>pow(x, y)</code> - x raised to y</li>
        <li><code>hypot(x, y)</code> - Euclidean distance</li>
        <li><code>gcd(a, b)</code> - greatest common divisor</li>
        <li><code>lcm(a, b)</code> - least common multiple</li>
        <li><code>factorial(n)</code> - n!</li>
        <li><code>clamp(x, lo, hi)</code> - clamp x to [lo, hi]</li>
        <li><code>lerp(a, b, t)</code> - linear interpolation</li>
        <li><code>sign(x)</code> - -1, 0, or 1</li>
        <li><code>degrees(r)</code> / <code>radians(d)</code> - angle conversion</li>
        <li><code>fmod(x, y)</code> - floating-point remainder</li>
        <li><code>modf(x)</code> - integer and fractional parts</li>
        <li><code>copysign(x, y)</code> - x with sign of y</li>
        <li><code>isclose(a, b)</code> - approximate equality</li>
        <li><code>frexp(x)</code> / <code>ldexp(m, e)</code> - mantissa/exponent split and compose</li>
        <li><code>comb(n, k)</code> - n choose k</li>
        <li><code>perm(n, k)</code> - n permute k</li>
      </UL>

      <H3 id="fn-pred">Predicates</H3>
      <P>
        <code>is_nan(x)</code> - true if x is NaN{" "}
        <br />
        <code>is_inf(x)</code> - true if x is infinite
      </P>

      <H3 id="fn-agg">Aggregate</H3>
      <P>
        <code>prod(arr)</code>, <code>sum(arr)</code>, <code>min(arr)</code>,{" "}
        <code>max(arr)</code>, <code>mean(arr)</code> - operate on arrays.
      </P>

      <H3 id="fn-special">Special functions</H3>
      <P>
        <code>erf(x)</code>, <code>erfc(x)</code>, <code>gamma(x)</code>,{" "}
        <code>lgamma(x)</code>
      </P>

      <H2 id="examples">Examples</H2>
      <CodeBlock
        runnable
        code={`import math

println(math.sqrt(16))           -- 4.0
println(math.gcd(12, 8))         -- 4
println(math.factorial(5))       -- 120
println(math.clamp(15, 0, 10))   -- 10.0
println(math.sign(-5))           -- -1
println(math.degrees(math.PI))   -- 180.0
println(math.lerp(0, 100, 0.5))  -- 50.0
println(math.hypot(3, 4))        -- 5.0
println(math.is_nan(math.NAN))   -- true`}
      />
    </DocLayout>
  );
}
