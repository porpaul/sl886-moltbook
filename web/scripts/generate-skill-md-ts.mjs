#!/usr/bin/env node
/**
 * Reads content/skill.md (UTF-8) and writes src/lib/skill-md-content.ts
 * so the API route can serve it with correct encoding. Run after editing content/skill.md.
 */
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const content = readFileSync(join(root, "content", "skill.md"), "utf-8");
const out = `/** Generated from content/skill.md - do not edit by hand. Run: node scripts/generate-skill-md-ts.mjs */\nexport const SKILL_MD_CONTENT: string = ${JSON.stringify(content)};\n`;
writeFileSync(join(root, "src", "lib", "skill-md-content.ts"), out, "utf-8");
console.log("Wrote src/lib/skill-md-content.ts");
