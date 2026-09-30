import { createMarkdownProcessor } from "@astrojs/markdown-remark";
import remarkMath from "remark-math";

const textOf = node => node.value ?? (node.children ?? []).map(textOf).join("");

export async function checkBilingualFormat(body) {
  const problems = [];
  const codeRanges = [];
  const processor = await createMarkdownProcessor({
    syntaxHighlight: false,
    smartypants: false,
    remarkPlugins: [
      remarkMath,
      () => tree => {
        function visit(node) {
          if (node.type === "code" || node.type === "inlineCode") {
            codeRanges.push([node.position.start.offset, node.position.end.offset]);
            return;
          }
          if (node.type === "emphasis" && /\p{Script=Han}/u.test(textOf(node))) {
            problems.push({ line: node.position.start.line, message: "Chinese emphasis must use upright text or bold" });
          }
          for (const child of node.children ?? []) visit(child);
        }
        visit(tree);
      },
    ],
  });
  await processor.render(body);
  let visible = body;
  for (const [start, end] of codeRanges.sort((a, b) => b[0] - a[0])) {
    visible = visible.slice(0, start) + visible.slice(start, end).replace(/[^\n]/g, " ") + visible.slice(end);
  }
  const stack = [];
  let units = 0;
  const lineAt = offset => visible.slice(0, offset).split("\n").length;
  for (const match of visible.matchAll(/<\/?div\b[^>]*>/g)) {
    const tag = match[0];
    if (tag.startsWith("</")) {
      const block = stack.pop();
      if (!block) {
        problems.push({ line: lineAt(match.index), message: "bilingual markup has an unmatched closing div" });
        continue;
      }
      if (block.unit && block.languages.join(",") !== "en,zh-CN") {
        problems.push({ line: block.line, message: "a bilingual unit requires English followed by Chinese in two direct language blocks" });
      }
      continue;
    }
    const className = tag.match(/\bclass=["']([^"']*)["']/)?.[1] ?? "";
    const unit = className.split(/\s+/).includes("bilingual-unit");
    const lang = tag.match(/\blang=["']([^"']*)["']/)?.[1];
    if (stack.at(-1)?.unit && lang) stack.at(-1).languages.push(lang);
    if (unit) units++;
    stack.push({ unit, languages: [], line: lineAt(match.index) });
  }
  for (const block of stack) problems.push({ line: block.line, message: "bilingual markup has an unclosed div" });
  if (!units) problems.push({ line: 1, message: "bilingual: true requires explicit bilingual units" });
  return problems;
}
