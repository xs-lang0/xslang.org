import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, Lead, P, Note, Warn } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "Concurrency · XS Guide" },
  description: "XS has real OS threads via spawn, async/await for I/O, channels for message passing, actors for encapsulated state, and nurseries for structured concurrency.",
};

export const headings: Heading[] = [
  { id: "spawn", label: "spawn", level: 2 },
  { id: "async-await", label: "async / await", level: 2 },
  { id: "channels", label: "Channels", level: 2 },
  { id: "actors", label: "Actors", level: 2 },
  { id: "nurseries", label: "Nurseries", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="guide" slug="concurrency" headings={headings}>
      <H1>Concurrency</H1>
      <Lead>
        XS has real OS threads via <code>spawn</code>, async/await for I/O,
        channels for message passing, actors for encapsulated state, and
        nurseries for structured concurrency.
      </Lead>

      <Warn>
        Snippets that use <code>spawn</code>, channels, or actors are marked
        non-runnable. The playground runs in a single-threaded WASM context
        and cannot execute concurrent code.
      </Warn>

      <H2 id="spawn">spawn</H2>

      <P>
        <code>spawn</code> runs a block on a real OS thread. Bytecode execution
        is GIL-serialised, so two pure-compute threads take turns rather than
        running fully in parallel. Blocking calls (<code>time.sleep</code>,
        channel ops, I/O) release the GIL, so one thread can run while another
        waits.
      </P>

      <CodeBlock
        noRun
        code={`var done = false
let t = spawn { done = true }
println(done)                    -- false (spawn runs concurrently)
await t
println(done)                    -- true

-- await returns the body's value
let result = spawn { 1 + 2 }
println(await result)            -- 3`}
      />

      <H2 id="async-await">async / await</H2>

      <CodeBlock
        noRun
        code={`async fn compute(x) {
  return x * 2
}

let r = await compute(21)
println(r)                       -- 42

async fn fetch_user(id) {
  return #{"id": id, "name": "User {id}"}
}

let user = await fetch_user(42)
println(user["name"])            -- User 42`}
      />

      <H2 id="channels">Channels</H2>

      <P>
        Channels are FIFO queues. Unbounded by default; pass a capacity to make
        them bounded. A bounded channel{"'"}s <code>send</code> blocks while
        the buffer is full.
      </P>

      <CodeBlock
        noRun
        code={`-- unbounded channel
let ch = channel()
ch.send("ping")
ch.send("pong")
println(ch.recv())               -- ping
println(ch.recv())               -- pong

-- bounded channel
let bch = channel(2)
bch.send("a")
bch.send("b")
println(bch.is_full())           -- true
println(bch.recv())              -- a`}
      />

      <P>
        <code>close()</code> marks a channel done. Subsequent <code>send</code>{" "}
        raises <code>ChannelClosed</code>; <code>recv</code> on a drained
        closed channel returns <code>null</code>. Use{" "}
        <code>recv_pair()</code> when the channel can carry real nulls:
      </P>

      <CodeBlock
        noRun
        code={`let ch = channel(2)
ch.send(null)
ch.send("hi")
ch.close()

ch.recv_pair()                   -- (null, true)  -- real null was sent
ch.recv_pair()                   -- ("hi", true)
ch.recv_pair()                   -- (null, false) -- closed and drained`}
      />

      <P>
        <code>select([ch1, ch2, ...])</code> returns{" "}
        <code>{"{"}</code>
        <code>index, value</code>
        <code>{"}"}</code> for the first channel with a buffered value.
        Returns <code>null</code> when nothing is ready.
      </P>

      <H2 id="actors">Actors</H2>

      <P>
        Actors encapsulate mutable state and handle method calls or raw
        messages. They are spawned once and run as a persistent thread.
      </P>

      <CodeBlock
        noRun
        code={`actor BankAccount {
  var balance = 0

  fn deposit(amount) {
    balance += amount
  }

  fn withdraw(amount) {
    if amount > balance { return Err("insufficient funds") }
    balance -= amount
    return Ok(balance)
  }

  fn get_balance() { return balance }

  fn handle(msg) {
    if msg == "reset" { balance = 0 }
  }
}

let acct = spawn BankAccount
acct.deposit(100)
acct.deposit(50)
println(acct.get_balance())      -- 150

acct ! "reset"                   -- send raw message
println(acct.get_balance())      -- 0`}
      />

      <H2 id="nurseries">Nurseries</H2>

      <P>
        A nursery block waits for all tasks spawned inside it to finish before
        continuing. No tasks leak out. When one task throws, the surviving
        siblings receive a cancellation signal and unwind cleanly.
      </P>

      <CodeBlock
        noRun
        code={`var results = []
nursery {
  spawn { results.push("a") }
  spawn { results.push("b") }
  spawn { results.push("c") }
}
-- all tasks complete before we reach here
println(results.sort())          -- ["a", "b", "c"]`}
      />

      <CodeBlock
        noRun
        code={`-- producer/consumer with a nursery
let pipe = channel()
var output = []

nursery {
  spawn {
    for i in 1..=3 { pipe.send(i * 10) }
  }
  spawn {
    for i in 0..3 { output.push(pipe.recv()) }
  }
}
println(output)                  -- [10, 20, 30]`}
      />

      <Note>
        Channels and nurseries are not available in the <code>--emit wasm</code>{" "}
        target. WASI does not grant real threads to a freestanding module, so
        concurrent operations lower to sequential equivalents on that backend.
      </Note>
    </DocLayout>
  );
}
