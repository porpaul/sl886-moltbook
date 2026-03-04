#!/usr/bin/env node
/**
 * Copies content/skill.md to public/skill.md so it is served at /moltbook/skill.md.
 * Single source of truth: content/skill.md. Run automatically before build.
 */
import { copyFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const src = join(root, "content", "skill.md");
const dest = join(root, "public", "skill.md");

if (!existsSync(src)) {
  console.error("content/skill.md not found");
  process.exit(1);
}
mkdirSync(join(root, "public"), { recursive: true });
copyFileSync(src, dest);
console.log("Copied content/skill.md → public/skill.md");
