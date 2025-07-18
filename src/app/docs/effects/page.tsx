import { CodeBlock } from "@/components/code-block";

export default function EffectsPage() {
  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold tracking-tight">Effects</h1>
      <p className="mb-8 text-muted">
        Algebraic effects let you perform an operation without knowing how it will be
        handled. The handler decides. Think of it as exceptions you can resume from.
      </p>

      <h2 className="mb-4 text-xl font-semibold">Basic usage</h2>
      <CodeBlock
        code={`-- declare an effect
effect Ask {
  fn prompt(msg) -> str
}

-- perform an effect
fn greet() {
  let name = perform Ask.prompt("name?")
  return "Hello, {name}!"
}

-- handle the effect
let result = handle greet() {
  Ask.prompt(msg) => resume("World")
}
println(result)  -- Hello, World!`}
      />
      <p className="mt-4 mb-8 text-sm text-muted">
        <code className="text-foreground">resume</code> returns a value to
        the <code className="text-foreground">perform</code> site -- execution continues
        from where it left off.
      </p>

      <h2 className="mb-4 text-xl font-semibold">Accumulation</h2>
      <CodeBlock
        code={`effect Log {
  fn log(msg)
}

var logs = []
handle {
  perform Log.log("first")
  perform Log.log("second")
  perform Log.log("third")
} {
  Log.log(msg) => {
    logs.push(msg)
    resume(null)
  }
}
println(logs)  -- ["first", "second", "third"]`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Multiple effects</h2>
      <CodeBlock
        code={`effect Fail {
  fn fail(msg)
}

effect Ask {
  fn ask(prompt) -> str
}

fn login() {
  let user = perform Ask.ask("username: ")
  let pass = perform Ask.ask("password: ")
  if not auth(user, pass) {
    perform Fail.fail("invalid credentials")
  }
}

handle {
  login()
} {
  Fail.fail(msg) => println("error: {msg}")
  Ask.ask(prompt) => {
    print(prompt)
    resume(readline())
  }
}`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Comparison</h2>
      <p className="text-sm text-muted">
        Effects are similar to exceptions, but with a key difference: you can resume.
        This makes them useful for dependency injection, testing, and building
        middleware-like abstractions where the caller decides how to fulfill a request.
      </p>
    </div>
  );
}
