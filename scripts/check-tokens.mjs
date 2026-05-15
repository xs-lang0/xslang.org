#!/usr/bin/env node
import { readFileSync } from "fs";
import { join } from "path";

const a = readFileSync(join(process.cwd(), "src/components/tokens.css"), "utf8");
const REG = process.env.REGISTRY_PATH ?? join(process.cwd(), "..", "registry");
let b;
try {
  b = readFileSync(join(REG, "src/components/tokens.css"), "utf8");
} catch {
  console.warn("registry tokens.css not found, skipping drift check");
  process.exit(0);
}
if (a !== b) {
  console.error("tokens.css drift between xslang.org and registry");
  process.exit(1);
}
console.log("tokens.css matches");
