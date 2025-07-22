import { CodeBlock } from "@/components/code-block";

export default function TemporalPage() {
  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold tracking-tight">
        Temporal Primitives
      </h1>
      <p className="mb-8 text-muted">
        First-class time-based control flow. No libraries, no callbacks, just
        keywords.
      </p>

      <h2 className="mb-4 text-xl font-semibold">every</h2>
      <p className="mb-4 text-muted">
        Run a block on an interval. In the interpreter, executes once. When
        transpiled to JS, maps to <code className="text-foreground">setInterval</code>.
      </p>
      <CodeBlock
        code={`use literals duration

every 5s {
    println("health check")
    ping_server()
}

every 100ms {
    update_display()
}`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">after</h2>
      <p className="mb-4 text-muted">
        Run a block after a delay.
      </p>
      <CodeBlock
        code={`use literals duration

after 2s {
    println("ready")
}

after 500ms {
    fade_in(element)
}`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">timeout</h2>
      <p className="mb-4 text-muted">
        Run a block with a time limit. If it doesn&apos;t complete in time, run
        the else block instead.
      </p>
      <CodeBlock
        code={`use literals duration

timeout 3s {
    let data = fetch_from_api()
    process(data)
} else {
    println("request timed out")
    use_cached_data()
}

-- without else, panics on timeout
timeout 10s {
    run_migration()
}`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">debounce</h2>
      <p className="mb-4 text-muted">
        Coalesce rapid executions into one. Only the last call within the delay
        window actually runs.
      </p>
      <CodeBlock
        code={`use literals duration

debounce 200ms {
    search(input.value)
}

debounce 1s {
    save_draft(editor.content)
}`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Practical examples</h2>
      <p className="mb-4 text-muted">
        Temporal primitives combine naturally with the rest of the language.
      </p>
      <CodeBlock
        code={`use literals duration, color

-- auto-reconnecting websocket
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

-- rate-limited api calls
fn poll_status(id) {
    var status = "pending"
    every 2s {
        timeout 5s {
            status = fetch("/api/status/{id}")
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
