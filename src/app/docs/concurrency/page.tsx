import { CodeBlock } from "@/components/code-block";

export default function ConcurrencyPage() {
  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold tracking-tight">Concurrency</h1>
      <p className="mb-8 text-muted">
        XS supports multiple concurrency models. Use whichever fits your problem.
      </p>

      <h2 className="mb-4 text-xl font-semibold">Spawn</h2>
      <CodeBlock
        runnable
        code={`var done = false
spawn { done = true }
println(done)  -- true

-- spawn returns a task handle
let t = spawn { 1 + 2 }
println(t["_result"])  -- 3
println(t["_status"])  -- done`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Async / await</h2>
      <CodeBlock
        runnable
        code={`async fn compute(x) {
  return x * 2
}

let r = await compute(21)
println(r)  -- 42

async fn fetch_user(id) {
  return #{"id": id, "name": "User {id}"}
}

let user = await fetch_user(42)
println(user["name"])  -- User 42`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Channels</h2>
      <p className="mb-4 text-muted">
        FIFO message queues. Unbounded by default, or bounded with a capacity.
      </p>
      <CodeBlock
        runnable
        code={`-- unbounded
let ch = channel()
ch.send("ping")
ch.send("pong")
println(ch.recv())      -- ping
println(ch.recv())      -- pong

-- bounded
let bch = channel(2)
bch.send("a")
bch.send("b")
println(bch.is_full())  -- true
println(bch.recv())     -- a`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Actors</h2>
      <p className="mb-4 text-muted">
        Actors encapsulate state and respond to method calls or raw messages.
      </p>
      <CodeBlock
        runnable
        code={`actor BankAccount {
  var balance = 0

  fn deposit(amount) {
    balance = balance + amount
  }

  fn withdraw(amount) {
    if amount > balance { return Err("insufficient funds") }
    balance = balance - amount
    return Ok(balance)
  }

  fn get_balance() { return balance }

  -- handle() processes raw messages sent with !
  fn handle(msg) {
    if msg == "reset" { balance = 0 }
  }
}

let acct = spawn BankAccount
acct.deposit(100)
acct.deposit(50)
println(acct.get_balance())  -- 150

-- send raw message with !
acct ! "reset"
println(acct.get_balance())  -- 0`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Nurseries</h2>
      <p className="mb-4 text-muted">
        Structured concurrency. All spawned tasks must complete before the nursery exits.
        No tasks leak out.
      </p>
      <CodeBlock
        runnable
        code={`var results = []
nursery {
  spawn { results.push("a") }
  spawn { results.push("b") }
  spawn { results.push("c") }
}
-- all tasks complete before we get here
println(results.sort())  -- ["a", "b", "c"]

-- nurseries compose with channels
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
println(output)  -- [10, 20, 30]`}
      />
    </div>
  );
}
