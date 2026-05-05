import { CodeBlock } from "@/components/code-block";

export default function DecoratorsPage() {
  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold tracking-tight">
        Decorators
      </h1>
      <p className="mb-8 text-muted">
        Decorators answer &ldquo;what triggers this function?&rdquo; They
        replace the boilerplate of an explicit{" "}
        <code className="text-foreground">main</code> dispatching to
        scheduling primitives, signal handlers, and watch loops. The
        runtime keeps the process alive while any persistent trigger is
        registered.
      </p>

      <h2 className="mb-4 text-xl font-semibold">Lifecycle</h2>
      <p className="mb-4 text-muted">
        <code className="text-foreground">@on_start</code> fires once
        after top-level statements run, before any{" "}
        <code className="text-foreground">main</code> is called.{" "}
        <code className="text-foreground">@on_exit</code> fires once after
        the event loop drains.{" "}
        <code className="text-foreground">@on_panic</code> wraps an
        otherwise-fatal exception with a chance to log or clean up.
      </p>
      <CodeBlock
        runnable
        code={`@on_start fn boot() {
    println("ready")
}

@on_exit fn cleanup() {
    println("bye")
}

@on_panic fn report(err) {
    println("crashed: {err}")
}

println("top-level statement")`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Signals</h2>
      <p className="mb-4 text-muted">
        <code className="text-foreground">@on_signal(name)</code>
        installs a handler for a POSIX-style signal. Names are the
        familiar <code className="text-foreground">INT</code>,{" "}
        <code className="text-foreground">TERM</code>,{" "}
        <code className="text-foreground">HUP</code>,{" "}
        <code className="text-foreground">USR1</code>,{" "}
        <code className="text-foreground">USR2</code>. The handler runs
        synchronously between bytecode steps so it never observes a
        torn value. On Windows, only{" "}
        <code className="text-foreground">INT</code> and{" "}
        <code className="text-foreground">TERM</code> are wired.
      </p>
      <CodeBlock
        code={`@on_signal("INT") fn graceful() {
    println("ctrl-c, draining...")
    flush_pending()
    exit(0)
}`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Time-based</h2>
      <p className="mb-4 text-muted">
        <code className="text-foreground">@every</code>,{" "}
        <code className="text-foreground">@delayed</code>, and{" "}
        <code className="text-foreground">@cron</code> all take a
        <a href="/docs/literals" className="underline ml-1">Duration</a>{" "}
        or, in the cron case, a five-field schedule. Combine them with{" "}
        <code className="text-foreground">@once</code> below to fire a
        single time.
      </p>
      <CodeBlock
        runnable
        code={`var n = 0

@every(50ms) fn tick() {
    n = n + 1
    println("tick {n}")
    if n >= 3 { exit(0) }
}

@delayed(20ms) fn warmup() {
    println("warm")
}`}
      />
      <p className="mt-4 text-sm text-muted">
        <code className="text-foreground">@cron</code> takes a unix-style
        five-field schedule. The parser supports{" "}
        <code className="text-foreground">*</code>,{" "}
        <code className="text-foreground">*/N</code>, ranges, and
        comma-separated lists across all five fields. Schedules fire at
        wall-clock boundaries.
      </p>
      <CodeBlock
        code={`@cron("0 * * * *") fn hourly() {
    rotate_logs()
}

@cron("*/5 * * * *") fn five_minute() {
    poll_jobs()
}`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Filesystem</h2>
      <p className="mb-4 text-muted">
        <code className="text-foreground">@watch(path)</code> fires when a
        path changes. Linux uses inotify; everything else falls back to a
        size + mtime stat poll.
      </p>
      <CodeBlock
        code={`@watch("./config.toml") fn reload() {
    println("config changed, reloading")
    config = parse_toml(fs.read("./config.toml"))
}`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Discovery</h2>
      <p className="mb-4 text-muted">
        <code className="text-foreground">@bench</code> and{" "}
        <code className="text-foreground">@example</code> mark functions
        for the test runner and doc generator. They don&apos;t run on
        their own &ndash; the tool that picks them up does.
      </p>
      <CodeBlock
        code={`@bench fn parse_speed() {
    parse(big_input)
}

@example fn doubling() {
    assert_eq(double(2), 4)
}`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">API</h2>
      <p className="mb-4 text-muted">
        <code className="text-foreground">@export(&quot;name&quot;)</code>{" "}
        publishes a function under a different identifier. Useful when you
        want the source name to follow internal conventions but the
        callable name to follow a public API.
      </p>
      <CodeBlock
        runnable
        code={`@export("greet") fn _internal_greet() {
    println("hello!")
}

greet()`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Modifiers</h2>
      <p className="mb-4 text-muted">
        <code className="text-foreground">@once</code> composes with any
        of the trigger decorators above. Whatever the trigger says,{" "}
        <code className="text-foreground">@once</code> collapses it to a
        single fire.
      </p>
      <CodeBlock
        runnable
        code={`@once @every(20ms) fn first_tick() {
    println("only fires once")
}

println("waiting for the tick...")`}
      />
      <p className="mt-4 text-sm text-muted">
        Same shape works on every other trigger:{" "}
        <code className="text-foreground">@once @on_signal(&quot;HUP&quot;)</code>{" "}
        for a fire-and-uninstall handler,{" "}
        <code className="text-foreground">@once @watch(path)</code> for a
        single notification.
      </p>

      <h2 className="mb-4 mt-12 text-xl font-semibold">Reference</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-muted border-b border-border">
            <tr>
              <th className="py-2 pr-6">Decorator</th>
              <th className="py-2 pr-6">Fires</th>
              <th className="py-2">Notes</th>
            </tr>
          </thead>
          <tbody className="text-foreground">
            <tr className="border-b border-border">
              <td className="py-2 pr-6 font-mono">@on_start</td>
              <td className="py-2 pr-6">once, before main body</td>
              <td className="py-2">no args</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-6 font-mono">@on_exit</td>
              <td className="py-2 pr-6">once, after event loop</td>
              <td className="py-2">no args</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-6 font-mono">@on_signal(name)</td>
              <td className="py-2 pr-6">on signal</td>
              <td className="py-2">INT / TERM portable; HUP / USR* unix-only</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-6 font-mono">@on_panic</td>
              <td className="py-2 pr-6">on uncaught throw</td>
              <td className="py-2">receives the error</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-6 font-mono">@every(d)</td>
              <td className="py-2 pr-6">every d</td>
              <td className="py-2">d is a Duration</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-6 font-mono">@delayed(d)</td>
              <td className="py-2 pr-6">once after d</td>
              <td className="py-2">d is a Duration</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-6 font-mono">@cron(expr)</td>
              <td className="py-2 pr-6">on cron schedule</td>
              <td className="py-2">five-field POSIX</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-6 font-mono">@watch(path)</td>
              <td className="py-2 pr-6">on path change</td>
              <td className="py-2">inotify on linux, poll elsewhere</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-6 font-mono">@bench</td>
              <td className="py-2 pr-6">via test runner</td>
              <td className="py-2">discovery only</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-6 font-mono">@example</td>
              <td className="py-2 pr-6">via test runner / docs</td>
              <td className="py-2">discovery only</td>
            </tr>
            <tr className="border-b border-border">
              <td className="py-2 pr-6 font-mono">@export(name)</td>
              <td className="py-2 pr-6">at registration</td>
              <td className="py-2">public alias for the fn</td>
            </tr>
            <tr>
              <td className="py-2 pr-6 font-mono">@once</td>
              <td className="py-2 pr-6">collapses other triggers</td>
              <td className="py-2">composes with the rest</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
