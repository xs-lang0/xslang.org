import { NextResponse } from "next/server";
import { execFile } from "child_process";
import { writeFile, unlink, chmod } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { randomBytes } from "crypto";

const MAX_CODE_LENGTH = 10000;
const TIMEOUT_MS = 5000;

function getXsBinary(): string {
  // in production (Vercel), the binary is at the project root
  // locally, it could be in bin/ or PATH
  const path = join(process.cwd(), "bin", "xs");
  return path;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.code || typeof body.code !== "string") {
    return NextResponse.json({ error: "code required" }, { status: 400 });
  }

  if (body.code.length > MAX_CODE_LENGTH) {
    return NextResponse.json(
      { error: "code too long (max 10000 chars)" },
      { status: 400 }
    );
  }

  // block dangerous patterns
  if (
    body.code.includes("inline_c") ||
    body.code.includes("__raw") ||
    body.code.includes("import \"os\"") ||
    body.code.includes("import \"fs\"") ||
    body.code.includes("import \"process\"")
  ) {
    return NextResponse.json(
      { error: "blocked: unsafe operations not allowed in playground" },
      { status: 400 }
    );
  }

  const id = randomBytes(8).toString("hex");
  const tmpFile = join(tmpdir(), `xs-playground-${id}.xs`);

  try {
    await writeFile(tmpFile, body.code);

    const xsBin = getXsBinary();

    // ensure binary is executable
    try {
      await chmod(xsBin, 0o755);
    } catch {}

    const js = await new Promise<string>((resolve, reject) => {
      execFile(
        xsBin,
        ["--emit", "js", tmpFile],
        { timeout: TIMEOUT_MS, maxBuffer: 1024 * 1024 },
        (err, stdout, stderr) => {
          if (err) {
            reject(new Error(stderr || err.message));
          } else {
            resolve(stdout);
          }
        }
      );
    });

    return NextResponse.json({ js });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "transpilation failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  } finally {
    unlink(tmpFile).catch(() => {});
  }
}
