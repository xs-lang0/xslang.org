import { CodeBlock } from "@/components/code-block";

export default function LiteralsPage() {
  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold tracking-tight">
        Duration literals
      </h1>
      <p className="mb-8 text-muted">
        A number followed by a time unit is a real{" "}
        <code className="text-foreground">Duration</code> value, not sugar
        for a float. Always on, no pragma needed.
      </p>

      <h2 className="mb-4 text-xl font-semibold">The basics</h2>
      <p className="mb-4 text-muted">
        Suffixes are{" "}
        <code className="text-foreground">ns</code>,{" "}
        <code className="text-foreground">us</code>,{" "}
        <code className="text-foreground">ms</code>,{" "}
        <code className="text-foreground">s</code>,{" "}
        <code className="text-foreground">m</code>,{" "}
        <code className="text-foreground">h</code>, and{" "}
        <code className="text-foreground">d</code>. Storage is an int64
        nanosecond count, so a duration round-trips losslessly through{" "}
        <code className="text-foreground">.ns</code>.
      </p>
      <CodeBlock
        runnable
        code={`let frame = 16ms
let tick  = 1us
let step  = 1ns
let day   = 1d

println(typeof(5s))   -- duration
println(5s == 5000ms) -- true
println((1ms).ns)     -- 1000000`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Compound and float forms</h2>
      <p className="mb-4 text-muted">
        Adjacent units stack into a single duration. Floats work too, with
        the obvious meaning.
      </p>
      <CodeBlock
        runnable
        code={`let warmup = 2m30s
let half   = 0.5s
let nps    = 1500ns

println(warmup)   -- 2m30s
println(half)     -- 500ms
println(nps)      -- 1.5us`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Arithmetic</h2>
      <p className="mb-4 text-muted">
        Durations add and subtract with each other, multiply and divide by
        numbers, and divide by another duration to get a ratio. Ordering
        works as you would expect.
      </p>
      <CodeBlock
        runnable
        code={`println(2s + 500ms)    -- 2.5s
println(1m - 30s)      -- 30s
println(100ms * 3)     -- 300ms
println(2s / 4)        -- 500ms
println(1s / 250ms)    -- 4

println(500ms < 1s)    -- true
println(2h > 90m)      -- true`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Field access</h2>
      <p className="mb-4 text-muted">
        The integer{" "}
        <code className="text-foreground">.ns</code> accessor is the canonical
        unit. Coarser fields like{" "}
        <code className="text-foreground">.s</code> and{" "}
        <code className="text-foreground">.m</code> return floats so partial
        units don&rsquo;t silently truncate.
      </p>
      <CodeBlock
        runnable
        code={`println((1500ms).s)   -- 1.5
println((90s).m)      -- 1.5
println((5s).ns)      -- 5000000000`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Where they show up</h2>
      <p className="mb-4 text-muted">
        Anywhere the language asks for a time interval. Scheduling
        primitives (<code className="text-foreground">after</code>,{" "}
        <code className="text-foreground">every</code>,{" "}
        <code className="text-foreground">timeout</code>), the time-based{" "}
        <a href="/docs/decorators" className="underline">decorators</a>{" "}
        (<code className="text-foreground">@every</code>,{" "}
        <code className="text-foreground">@delayed</code>),{" "}
        <code className="text-foreground">time.sleep</code> in the stdlib,
        and channel <code className="text-foreground">recv_timeout</code>{" "}
        all take the same{" "}
        <code className="text-foreground">Duration</code> type.
      </p>
      <CodeBlock
        runnable
        code={`after 100ms {
    println("ready")
}

every 100ms {
    println("tick")
}

@delayed(50ms) fn warmup() {
    println("warm")
}`}
      />
    </div>
  );
}
