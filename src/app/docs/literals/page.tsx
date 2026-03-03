import { CodeBlock } from "@/components/code-block";

export default function LiteralsPage() {
  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold tracking-tight">
        Universal Literals
      </h1>
      <p className="mb-8 text-muted">
        XS supports typed literal values for common domains. Enable them
        per-file with the <code className="text-foreground">use literals</code> pragma.
      </p>

      <h2 className="mb-4 text-xl font-semibold">Enabling literals</h2>
      <p className="mb-4 text-muted">
        Pick only the literal types you need. This keeps the parser fast and
        avoids surprises.
      </p>
      <CodeBlock
        code={`use literals duration, color, date, size, angle`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Duration</h2>
      <p className="mb-4 text-muted">
        Number followed by a time unit. Stored as milliseconds.
      </p>
      <CodeBlock
        runnable
        code={`use literals duration

let quick = 200ms
let sec = 5s
let mins = 2m
let hour = 1h
let days = 3d

println(5s)       -- 5000
println(200ms)    -- 200
println(1h)       -- 3600000

-- compound durations
let runtime = 2m + 30s   -- 150000ms`}
      />
      <p className="mt-4 text-sm text-muted">
        Suffixes: <code className="text-foreground">ms</code>,{" "}
        <code className="text-foreground">s</code>,{" "}
        <code className="text-foreground">m</code>,{" "}
        <code className="text-foreground">h</code>,{" "}
        <code className="text-foreground">d</code>
      </p>

      <h2 className="mb-4 mt-12 text-xl font-semibold">Color</h2>
      <p className="mb-4 text-muted">
        Hex color literals. Returns a map with r, g, b, a fields (0-255).
      </p>
      <CodeBlock
        runnable
        code={`use literals color

let red = #ff0000
let orange = #ff6600
let white = #ffffff

println(red.r)     -- 255
println(red.g)     -- 0
println(orange.g)  -- 102`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Date</h2>
      <p className="mb-4 text-muted">
        ISO 8601 date literals. Stored as a string for now. Date
        arithmetic and integration with temporal primitives is planned.
      </p>
      <CodeBlock
        runnable
        code={`use literals date

let release = 2024-03-15
let meeting = 2024-12-01

println(release)   -- 2024-03-15`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Size</h2>
      <p className="mb-4 text-muted">
        Byte size literals. Stored as a float in bytes.
      </p>
      <CodeBlock
        runnable
        code={`use literals size

let config = 4kb       -- 4096
let image = 2mb        -- 2097152
let disk = 500gb       -- 536870912000

println(10kb)   -- 10240`}
      />
      <p className="mt-4 text-sm text-muted">
        Suffixes: <code className="text-foreground">kb</code>,{" "}
        <code className="text-foreground">mb</code>,{" "}
        <code className="text-foreground">gb</code>,{" "}
        <code className="text-foreground">tb</code>
      </p>

      <h2 className="mb-4 mt-12 text-xl font-semibold">Angle</h2>
      <p className="mb-4 text-muted">
        Angle literals. Stored as radians.
      </p>
      <CodeBlock
        runnable
        code={`use literals angle

let right = 90deg      -- 1.5708 (pi/2)
let half = 180deg      -- 3.14159 (pi)
let tau = 6.28rad      -- 6.28

println(90deg)  -- 1.5708`}
      />
      <p className="mt-4 text-sm text-muted">
        Suffixes: <code className="text-foreground">deg</code> (converted to radians),{" "}
        <code className="text-foreground">rad</code> (stored as-is)
      </p>

      <h2 className="mb-4 mt-12 text-xl font-semibold">Combining literals</h2>
      <p className="mb-4 text-muted">
        Enable multiple types in one pragma. They compose naturally.
      </p>
      <CodeBlock
        runnable
        code={`use literals duration, color, size

let timeout = 30s
let bg = #1a1a2e
let max_upload = 50mb

if file_size > max_upload {
    println("file too large")
}`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Without the pragma</h2>
      <p className="mb-4 text-muted">
        Without <code className="text-foreground">use literals</code>, suffixes like{" "}
        <code className="text-foreground">5s</code> are a syntax error and{" "}
        <code className="text-foreground">#ff6600</code> is not recognized as a color.
        This is intentional: literals are opt-in so they never surprise you in
        files that don&apos;t expect them.
      </p>

      <h2 className="mb-4 mt-12 text-xl font-semibold">Notes</h2>
      <ul className="text-muted space-y-2 list-disc list-inside text-sm">
        <li>
          Duration, size, and angle literals are syntactic sugar for float values.
          You can do arithmetic on them: <code className="text-foreground">5s + 200ms</code>,{" "}
          <code className="text-foreground">4kb + 512</code>.
        </li>
        <li>
          Size literals use binary units: 1kb = 1024 bytes, 1mb = 1024 kb, etc.
        </li>
        <li>
          Angle literals in <code className="text-foreground">deg</code> are converted to radians.{" "}
          <code className="text-foreground">90deg</code> is just <code className="text-foreground">1.5708</code>.
        </li>
      </ul>
    </div>
  );
}
