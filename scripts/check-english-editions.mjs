import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

function frontmatter(raw) {
  return raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1] ?? "";
}

export function checkEnglishEditions(posts, jottingsRoot, report) {
  function checkPair(source, translation) {
    if (!translation) {
      report(source, 1, "is missing its English edition");
      return;
    }
    const english = readFileSync(translation, "utf8");
    const digest = createHash("sha256").update(readFileSync(source)).digest("hex");
    const recorded = frontmatter(english).match(/^sourceDigest:\s*["']?([a-f0-9]{64})["']?\s*$/m)?.[1];
    if (recorded !== digest) {
      report(translation, 1, `is out of sync with ${source}. Review both editions and update sourceDigest to ${digest}`);
    }
    if (!english.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, "").trim()) {
      report(translation, 1, "must have a translated body");
    }
  }

  for (const post of posts) {
    const original = readFileSync(post, "utf8");
    if (/^draft:\s*true\s*$/m.test(frontmatter(original))) continue;
    const stem = post.replace(/index\.mdx?$/, "_en");
    checkPair(post, [`${stem}.md`, `${stem}.mdx`].find(existsSync));
  }

  for (const file of readdirSync(jottingsRoot, { withFileTypes: true })) {
    if (!file.isFile() || file.name === "_template.md" || !file.name.endsWith(".md")) continue;
    const translation = join(jottingsRoot + "-en", file.name);
    checkPair(join(jottingsRoot, file.name), existsSync(translation) ? translation : undefined);
  }
}
