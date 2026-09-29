import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const check = fileURLToPath(new URL("./check-post-exclusivity.mjs", import.meta.url));

test("combined deployment refuses the same article in both repositories", t => {
  const root = mkdtempSync(path.join(os.tmpdir(), "post-exclusivity-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const formal = path.join(root, "formal");
  const draft = path.join(root, "draft");

  function post(repo, id, title, body) {
    const dir = path.join(repo, "src/content/posts", id);
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, "index.md"), `---\ntitle: "${title}"\n---\n\n${body}`);
  }

  post(formal, "0071", "First principles", "A substantive article.");
  post(draft, "0072", "Another article", "A different article.");
  const run = () => spawnSync(process.execPath, [check, formal, draft], { encoding: "utf8" });
  assert.equal(run().status, 0);

  post(draft, "0071", "Changed title", "Edited draft body.");
  assert.match(run().stderr, /shared ID 0071/);

  rmSync(path.join(draft, "src/content/posts/0071"), { recursive: true });
  post(draft, "0099", "First principles", "Edited draft body.");
  assert.match(run().stderr, /shared title/);
});
