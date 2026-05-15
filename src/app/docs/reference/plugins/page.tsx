import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P, Note, Warn, UL } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "Plugin system, XS Reference" };

export const headings: Heading[] = [
  { id: "what-is-a-plugin", label: "What is a plugin", level: 2 },
  { id: "loading", label: "Loading plugins", level: 2 },
  { id: "plugin-object", label: "The plugin object", level: 2 },
  { id: "metadata", label: "Metadata", level: 2 },
  { id: "injecting-globals", label: "Injecting globals", level: 2 },
  { id: "adding-methods", label: "Adding methods to types", level: 2 },
  { id: "eval-hooks", label: "Eval hooks", level: 2 },
  { id: "hook-handles", label: "Hook handles", level: 2 },
  { id: "syntax-extension", label: "Syntax extension", level: 2 },
  { id: "import-hooks", label: "Import hooks", level: 2 },
  { id: "lexer-transforms", label: "Lexer transforms", level: 2 },
  { id: "ast-constructors", label: "AST constructors", level: 2 },
  { id: "sandboxing", label: "Sandboxing", level: 2 },
  { id: "dependencies", label: "Dependencies and teardown", level: 2 },
  { id: "gotchas", label: "Gotchas", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="plugins" headings={headings}>
      <H1>Plugin system</H1>
      <Lead>Plugins are <code>.xs</code> files that get access to a special <code>plugin</code> object and can inject globals, add methods to built-in types, define new syntax, and hook into evaluation and parsing.</Lead>

      <H2 id="what-is-a-plugin">What is a plugin</H2>
      <P>
        A plugin is a regular XS file. When loaded, it gets a <code>plugin</code> variable
        that exposes surfaces into the host runtime: the global scope, the parser, the lexer,
        and the AST constructor table. Whatever the plugin registers through those surfaces
        affects every subsequent piece of code in the host program.
      </P>
      <CodeBlock code={`-- my_plugin.xs
plugin.meta = #{ name: "my_plugin", version: "0.1.0" }

plugin.runtime.global.set("greet", fn(name) {
    return "Hello, {name}!"
})`} />
      <CodeBlock code={`-- main.xs
load "my_plugin.xs"
println(greet("world"))  -- Hello, world!`} />

      <H2 id="loading">Loading plugins</H2>
      <P>
        <code>load "path/to/plugin.xs"</code> is the canonical form. The path is resolved
        relative to the loading file. Plugins execute top-to-bottom at load time, before the
        rest of the program. If a plugin fails for any reason, the host stops - no half-loaded
        state. Multiple plugins load in order; later ones can override globals from earlier
        ones.
      </P>
      <P>
        When two plugins introduce colliding names, use the <code>with</code> rename form:
      </P>
      <CodeBlock code={`load "plugin-a" with { ARROW: "pipe_arrow" }
load "plugin-b"`} />

      <H2 id="plugin-object">The plugin object</H2>
      <P>Every plugin file gets a <code>plugin</code> variable with these surfaces:</P>
      <UL>
        <li><code>plugin.runtime</code> - inject globals, add methods, eval/import/error hooks</li>
        <li><code>plugin.parser</code> - syntax handlers, parser overrides, parser primitives</li>
        <li><code>plugin.lexer</code> - register keywords, source transforms</li>
        <li><code>plugin.ast</code> - constructors for every AST node type</li>
        <li><code>plugin.meta</code> - plugin metadata map</li>
        <li><code>plugin.requires(name)</code> - declare a dependency on another loaded plugin</li>
        <li><code>plugin.teardown(fn)</code> - run cleanup when the interpreter exits</li>
        <li><code>plugin.hooks()</code> - inspect all currently registered hooks</li>
      </UL>

      <H2 id="metadata">Metadata</H2>
      <P>
        Set <code>plugin.meta</code> to a map with at least <code>name</code> and{" "}
        <code>version</code>. Only <code>name</code> is used by the runtime (for dependency
        checking). Everything else in the map is for humans.
      </P>
      <CodeBlock code={`plugin.meta = #{ name: "router", version: "2.1.0" }`} />

      <H2 id="injecting-globals">Injecting globals</H2>
      <P>
        The most common plugin operation. Injects a name into the host&apos;s global scope.
      </P>
      <CodeBlock code={`plugin.runtime.global.set("clamp", fn(val, lo, hi) {
    if val < lo { return lo }
    if val > hi { return hi }
    return val
})`} />
      <P>
        Also: <code>plugin.runtime.global.get(name)</code> to read an existing global, and{" "}
        <code>plugin.runtime.global.names()</code> to list all global names.
      </P>
      <Note>
        The semantic analyzer warns about plugin-injected names because sema runs before
        plugins load. The warnings are downgraded from errors to warnings intentionally;
        the code still runs fine.
      </Note>

      <H2 id="adding-methods">Adding methods to types</H2>
      <P>
        <code>plugin.runtime.add_method(type, name, fn)</code> adds a method to every value
        of that type. The <code>self</code> parameter receives the receiver.
      </P>
      <CodeBlock code={`plugin.runtime.add_method("str", "excited", fn(self) {
    return self ++ "!!!"
})

plugin.runtime.add_method("array", "sum", fn(self) {
    var total = 0
    for x in self { total = total + x }
    return total
})

-- in the host:
"hello".excited()    -- "hello!!!"
[1, 2, 3].sum()      -- 6`} />
      <P>
        Valid type names: <code>"str"</code>, <code>"int"</code>, <code>"float"</code>,{" "}
        <code>"array"</code>, <code>"map"</code>, <code>"bool"</code>.
      </P>

      <H2 id="eval-hooks">Eval hooks</H2>
      <P>
        <code>before_eval</code> fires before a node is evaluated; <code>after_eval</code>{" "}
        fires after. Both take an optional tag filter to restrict which node types trigger
        the hook.
      </P>
      <CodeBlock code={`let handle = plugin.runtime.before_eval("call", fn(node) {
    println("about to call")
    return node  -- must return the node
})

plugin.runtime.after_eval("call", fn(node, result) {
    println("call returned: {result}")
    return result  -- must return the result
})`} />
      <P>
        Common tags: <code>"call"</code>, <code>"binop"</code>, <code>"ident"</code>,{" "}
        <code>"let"</code>, <code>"assign"</code>, <code>"if"</code>, <code>"for"</code>,{" "}
        <code>"while"</code>, <code>"fn"</code>, <code>"return"</code>, <code>"block"</code>.
        Omit the tag to hook every node (slow).
      </P>

      <H2 id="hook-handles">Hook handles</H2>
      <P>
        Every hook registration returns a handle with a <code>.remove()</code> method. Once
        removed, the hook stops firing. Works for <code>before_eval</code>, <code>after_eval</code>,
        <code>on_unknown</code>, <code>on_unknown_expr</code>, <code>on_postfix</code>,{" "}
        <code>resolve_import</code>, <code>on_error</code>, and <code>transform</code>.
      </P>
      <CodeBlock code={`let trace = plugin.runtime.before_eval("call", fn(node) {
    println("trace: {node}")
    return node
})

trace.remove()  -- disable it`} />

      <H2 id="syntax-extension">Syntax extension</H2>
      <P>
        For new statement-level syntax, use the declarative{" "}
        <code>plugin "name" {"{ parser { production NAME(...) { ... } } }"}</code> form. This
        is the only path that works at parse time, so the new keyword is available in the
        same file that defines it.
      </P>
      <CodeBlock code={`plugin "unless" {
  meta { id: "unless"; version: "0.1.0" }

  parser {
    production unless(parser, token) {
      let cond = parser.expr()
      let body = parser.block()
      plugin.ast.if_expr(plugin.ast.unary("!", cond), body)
    }
  }
}

unless x > 10 {
    println("x is small")
}`} />

      <H3 id="parser-access">Parser access inside handlers</H3>
      <P>Inside any parser callback you can call:</P>
      <UL>
        <li><code>plugin.parser.expr()</code> - parse and consume one expression</li>
        <li><code>plugin.parser.block()</code> - parse and consume a block</li>
        <li><code>plugin.parser.ident()</code> - consume an identifier</li>
        <li><code>plugin.parser.expect(kind)</code> - consume a specific token kind</li>
        <li><code>plugin.parser.at(kind)</code> - peek without consuming</li>
        <li><code>plugin.parser.peek(offset)</code> - look ahead by offset</li>
      </UL>

      <H3 id="parser-override">Parser override</H3>
      <P>
        Override how a built-in keyword is parsed. The <code>previous</code> function chains
        back to the default or the previous override.
      </P>
      <CodeBlock code={`plugin.parser.override("fn", fn(previous) {
    let node = previous()  -- parse normally
    -- inspect or transform node
    return node
})`} />

      <H2 id="import-hooks">Import hooks</H2>
      <P>
        Intercept <code>import</code> statements to provide virtual modules. Always delegate
        unrecognized names to <code>previous</code>.
      </P>
      <CodeBlock code={`plugin.runtime.resolve_import(fn(name, previous) {
    if name == "server" {
        return #{
            start: fn(port) { println("listening on :{port}") }
        }
    }
    if previous != null { return previous(name) }
    return null
})`} />

      <H2 id="lexer-transforms">Lexer transforms</H2>
      <P>
        Transform the entire source string before parsing. Use sparingly - this is a blunt
        instrument that runs before any tokenization.
      </P>
      <CodeBlock code={`plugin.lexer.transform(fn(source) {
    return source.replace("MAGIC", "42")
})`} />

      <H2 id="ast-constructors">AST constructors</H2>
      <P>
        When writing syntax handlers, use <code>plugin.ast.*</code> to build AST nodes.
        Available constructors include literals (<code>int_node</code>, <code>str_node</code>,
        <code>bool_node</code>, <code>ident</code>), operators (<code>binop</code>,{" "}
        <code>unary</code>), calls (<code>call</code>, <code>method_call</code>), control flow
        (<code>if_expr</code>, <code>if_else</code>, <code>for_loop</code>,{" "}
        <code>while_loop</code>), declarations (<code>let_decl</code>, <code>var_decl</code>,{" "}
        <code>fn_decl</code>, <code>lambda</code>), and structure (<code>block</code>,{" "}
        <code>array</code>, <code>map</code>, <code>return_node</code>, <code>assign</code>).
        Temporal constructors (<code>every</code>, <code>after</code>, <code>timeout</code>,{" "}
        <code>debounce</code>) build the desugared form for scheduling constructs.
      </P>

      <H2 id="sandboxing">Sandboxing</H2>
      <P>
        Restrict what a plugin can do with <code>sandbox {"{ flags }"}</code>:
      </P>
      <CodeBlock code={`load "sketchy.xs" sandbox { inject_only }
load "another.xs" sandbox { no_override }
load "strict.xs"  sandbox { inject_only, no_override, no_eval_hook }`} />
      <UL>
        <li><code>inject_only</code> - <code>global.set</code> can only create new names, not overwrite existing ones</li>
        <li><code>no_override</code> - <code>plugin.parser.override</code> is disabled</li>
        <li><code>no_eval_hook</code> - <code>before_eval</code> and <code>after_eval</code> are disabled</li>
      </UL>
      <P>
        Violated sandbox rules silently fail with a stderr warning rather than crashing the
        host.
      </P>

      <H2 id="dependencies">Dependencies and teardown</H2>
      <P>
        Declare a dependency on another plugin by name (matched against{" "}
        <code>plugin.meta.name</code>). If the dependency was not loaded first, the load fails.
      </P>
      <CodeBlock code={`plugin.requires("base_framework")`} />
      <P>
        Register cleanup code to run on interpreter exit:
      </P>
      <CodeBlock code={`plugin.teardown(fn() {
    println("plugin shutting down")
})`} />

      <H2 id="gotchas">Gotchas</H2>
      <Warn>
        Hook registrations through <code>plugin.parser.on_unknown</code> and{" "}
        <code>plugin.lexer.add_keyword</code> happen at runtime (after the file is parsed),
        so they cannot introduce new statement keywords in the same file that calls{" "}
        <code>load</code>. Use the declarative <code>plugin "name" {"{ ... }"}</code> form
        for parse-time syntax extension.
      </Warn>
      <UL>
        <li>Plugin files run in a temporary interpreter; their closures still capture plugin-local variables.</li>
        <li>Load order matters. Later plugins can overwrite globals from earlier ones.</li>
        <li>If a plugin fails, the host does not execute. No partial state.</li>
        <li>Hook registries have fixed caps (64 eval hooks, 16 syntax handlers, etc.). Hitting a cap drops the hook with a stderr warning.</li>
      </UL>
    </DocLayout>
  );
}
