import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const [formalRoot, draftRoot] = process.argv.slice(2);
if (!formalRoot || !draftRoot) {
  throw new Error("Usage: node check-post-exclusivity.mjs <formal-repo> <draft-repo>");
}

function postsIn(repo) {
  const root = path.join(repo, "src/content/posts");
  if (!existsSync(root)) throw new Error(`Missing post directory: ${root}`);
  return readdirSync(root, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && /^\d+$/.test(entry.name))
    .flatMap(entry => {
      const dir = path.join(root, entry.name);
      const file = ["index.md", "index.mdx"]
        .map(name => path.join(dir, name))
        .find(existsSync);
      if (!file) return [];
      const raw = readFileSync(file, "utf8");
      const title = raw
        .match(/^title:\s*(.+)$/m)?.[1]
        .trim()
        .replace(/^["']|["']$/g, "")
        .normalize("NFC")
        .toLowerCase();
      const body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim();
      const bodyHash = createHash("sha256").update(body).digest("hex");
      return [{ id: entry.name, file, title, bodyHash }];
    });
}

const formalPosts = postsIn(formalRoot);
const draftPosts = postsIn(draftRoot);
const duplicates = [];
for (const formal of formalPosts) {
  for (const draft of draftPosts) {
    const reason = formal.id === draft.id
      ? `shared ID ${formal.id}`
      : formal.title && formal.title === draft.title
        ? `shared title ${formal.title}`
        : formal.bodyHash === draft.bodyHash
          ? "identical body"
          : null;
    if (reason) duplicates.push(`${reason}: ${formal.file} and ${draft.file}`);
  }
}

if (duplicates.length) {
  throw new Error(`Articles must exist in exactly one source repository:\n${duplicates.join("\n")}`);
}

console.log(`Post exclusivity passed: ${formalPosts.length} formal, ${draftPosts.length} draft.`);
