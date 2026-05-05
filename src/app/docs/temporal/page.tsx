import { CodeBlock } from "@/components/code-block";

export default function TemporalPage() {
  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold tracking-tight">
        Temporal Primitives
      </h1>
      <p className="mb-8 text-muted">
        First-class time-based control flow. No libraries, no callbacks,
        just keywords. Every interval here is a{" "}
        <a href="/docs/literals" className="underline">Duration</a>.
      </p>

      <div className="mb-8 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted">
        <strong className="text-foreground">Interpreter vs transpiled.</strong>{" "}
        In the interpreter the body runs once and the program continues.
        Transpiled to JS or C, these become real timers
        (<code className="text-foreground">setInterval</code>,{" "}
        <code className="text-foreground">setTimeout</code>, and friends).
        For functions you want the runtime to keep driving in interp too,{" "}
        <a href="/docs/decorators" className="underline">decorators</a>{" "}
        (<code className="text-foreground">@every</code>,{" "}
        <code className="text-foreground">@delayed</code>,{" "}
        <code className="text-foreground">@cron</code>) are the better fit.
      </div>

      <h2 className="mb-4 text-xl font-semibold">every</h2>
      <p className="mb-4 text-muted">
        Run a block on an interval.
      </p>
      <CodeBlock
        runnable
        code={`every 100ms {
    println("tick")
}
println("done")`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">after</h2>
      <p className="mb-4 text-muted">
        Run a block after a delay.
      </p>
      <CodeBlock
        runnable
        code={`println("waiting...")
after 200ms {
    println("ready")
}
println("done")`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">timeout</h2>
      <p className="mb-4 text-muted">
        Run a block with a time limit. If it doesn&apos;t complete in time,
        run the else block instead.
      </p>
      <CodeBlock
        runnable
        code={`timeout 200ms {
    println("inside the timeout")
} else {
    println("timed out")
}

-- without else, panics on timeout
timeout 1s {
    println("plenty of headroom")
}`}
      />

      <p className="mt-4 text-sm text-muted">
        Without <code className="text-foreground">else</code>, timeout
        panics. This is intentional: silent timeouts cause harder bugs
        than loud ones. Use the else block when you want graceful
        handling.
      </p>

      <h2 className="mb-4 mt-12 text-xl font-semibold">debounce</h2>
      <p className="mb-4 text-muted">
        Coalesce rapid executions into one. Only the last call within the
        delay window actually runs.
      </p>
      <CodeBlock
        runnable
        code={`debounce 100ms {
    println("only the last call wins")
}
println("after debounce")`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Practical shape</h2>
      <p className="mb-4 text-muted">
        These primitives compose with the rest of the language. Real
        programs hit them through{" "}
        <a href="/docs/decorators" className="underline">decorators</a> at
        the top level, and inline forms inside helper functions.
      </p>
      <CodeBlock
        code={`-- auto-reconnecting websocket
fn connect(url) {
    var retries = 0
    every 5s {
        try {
            let ws = open_ws(url)
            retries = 0
        } catch e {
            retries = retries + 1
            if retries > 10 {
                panic("gave up after 10 retries")
            }
        }
    }
}

-- bounded retry on a flaky api
fn poll_status(id) {
    every 2s {
        timeout 5s {
            handle(fetch("/api/status/{id}"))
        } else {
            println("poll timed out, retrying")
        }
    }
}`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Transpilation</h2>
      <p className="mb-4 text-muted">
        Temporal primitives map to platform-native constructs:
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-muted border-b border-border">
            <tr>
              <th className="py-2 pr-6">XS</th>
              <th className="py-2 pr-6">JavaScript</th>
              <th className="py-2">C</th>
            </tr>
          </thead>
          <tbody className="text-foreground">
            <tr className="border-b border-border">
              <td className="py-2 pr-6 font-mono">every</td>
              <td className="py-2 pr-6">setInterval</td>
              <td className="py-2">timer_create / CreateTimerQueueTimer</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-6 font-mono">after</td>
              <td className="py-2 pr-6">setTimeout</td>
              <td className="py-2">usleep / Sleep + thread</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-6 font-mono">timeout</td>
              <td className="py-2 pr-6">Promise.race + setTimeout</td>
              <td className="py-2">alarm / WaitForSingleObject</td>
            </tr>
            <tr>
              <td className="py-2 pr-6 font-mono">debounce</td>
              <td className="py-2 pr-6">clearTimeout + setTimeout</td>
              <td className="py-2">timer reset</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
