import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "Decorators · XS Guide" },
  description: "Decorators attach to function declarations. Trigger decorators schedule when the function runs. Wrapping decorators intercept every call and delegate to the original.",
};

export const headings: Heading[] = [
  { id: "trigger-decorators", label: "Trigger decorators", level: 2 },
  { id: "wrapping-decorators", label: "Wrapping decorators", level: 2 },
  { id: "composing", label: "Composing decorators", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="guide" slug="decorators" headings={headings}>
      <H1>Decorators</H1>
      <Lead>
        Decorators attach to function declarations. Trigger decorators schedule
        when the function runs. Wrapping decorators intercept every call and
        delegate to the original.
      </Lead>

      <H2 id="trigger-decorators">Trigger decorators</H2>

      <P>
        A trigger decorator answers "what schedules this function?" The runtime
        fires the body without a direct caller.
      </P>

      <CodeBlock
        noRun
        code={`-- lifecycle
@on_start fn boot() { setup_things() }
@on_exit  fn cleanup() { close_handles() }
@on_panic fn record() { telemetry.flush() }

-- schedule
@every(1s)            fn tick() { metrics.flush() }
@cron("0 * * * *")   fn hourly() { rotate_logs() }
@delayed(500ms)       fn warmup() { prefetch() }

-- file watching
@watch("./config.toml") fn config_changed() { config.reload() }

-- OS signals
@on_signal("INT") fn graceful() { state = "shutting_down" }`}
      />

      <P>
        The runtime stays alive while any persistent trigger is registered
        (<code>@every</code>, <code>@cron</code>, <code>@on_signal</code>,{" "}
        <code>@watch</code>). Once all have fired or been quiesced by{" "}
        <code>@once</code>, the process exits naturally.
      </P>

      <CodeBlock
        noRun
        code={`-- @once: fire exactly once, then stop
@once @every(5s) fn one_shot() { do_thing() }
-- equivalent to: fire after 5s, then don't reschedule`}
      />

      <P>
        Trigger-decorated functions must not take regular parameters. The
        runtime calls them with no arguments.
      </P>

      <H2 id="wrapping-decorators">Wrapping decorators</H2>

      <P>
        A wrapping decorator answers "what happens around every call?" The
        bound name becomes a dispatcher that intercepts the call.
      </P>

      <CodeBlock
        runnable
        code={`@memoize fn fib(n) {
  if n < 2 { return n }
  return fib(n - 1) + fib(n - 2)
}

println(fib(30))`}
      />

      <P>
        <code>@memoize</code> caches results by a key derived from the
        argument values. Recursive calls hit the same cache, so{" "}
        <code>fib(30)</code> only runs the body 31 times instead of
        exponentially many.
      </P>

      <CodeBlock
        noRun
        code={`-- @retry(n): run up to n attempts, swallow thrown exceptions
@retry(5) fn fetch(url) { http.get(url) }

-- @trace: print call name + args before, return value after (stderr)
@trace fn handle(req) { process(req) }

-- @timed: print elapsed milliseconds after each call
@timed fn build_index() { index_files() }`}
      />

      <P>
        All wrapping decorators pass arguments through unchanged and return the
        body{"'"}s result. <code>@retry</code> re-raises the final exception if
        every attempt fails, so the caller{"'"}s <code>try/catch</code> still
        sees it.
      </P>

      <H2 id="composing">Composing decorators</H2>

      <P>
        Multiple decorators on the same function stack in declaration order,
        outermost first:
      </P>

      <CodeBlock
        runnable
        code={`@timed @memoize fn expensive(x) {
  -- heavy computation
  var total = 0
  for i in 0..x { total += i }
  return total
}

println(expensive(1000))
println(expensive(1000))         -- second call hits cache; @timed measures the cache hit`}
      />

      <Note>
        <code>@test</code> and <code>@deprecated</code> are function attributes
        rather than decorators in the full sense. They are covered in{" "}
        <a href="/docs/guide/functions">Functions</a> and{" "}
        <a href="/docs/guide/testing">Testing</a>.
      </Note>
    </DocLayout>
  );
}
