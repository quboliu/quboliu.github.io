import assert from "node:assert/strict";
import test from "node:test";
import { createMarkdownProcessor } from "@astrojs/markdown-remark";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import rehypeBilingual from "../src/utils/rehypeBilingual.mjs";
import { checkBilingualFormat } from "./bilingual-format.mjs";

test("paired heading keeps its original anchor and one TOC entry", async () => {
  const source = "## *English*｜中文\n\nContent";
  const before = await (await createMarkdownProcessor({ syntaxHighlight: false })).render(source);
  const after = await (await createMarkdownProcessor({ syntaxHighlight: false, rehypePlugins: [rehypeRaw, rehypeBilingual] })).render(source);
  assert.deepEqual(after.metadata.headings, before.metadata.headings);
  assert.equal((after.code.match(/<h2\b/g) ?? []).length, 1);
  assert.match(after.code, /lang="en"[^>]*><em(?: lang="en")?>English<\/em>/);
  assert.match(after.code, /lang="zh-CN"/);
});

test("a migrated heading translation preserves an existing English anchor", async () => {
  const result = await (await createMarkdownProcessor({ syntaxHighlight: false, rehypePlugins: [rehypeRaw, rehypeBilingual] })).render("## Original\n\n<!-- bilingual-heading: 原标题 -->\n\nText");
  assert.equal(result.metadata.headings[0].slug, "original");
  assert.match(result.code, /<h2[^>]*id="original"[^>]*>[\s\S]*原标题<\/span><\/h2>/);
});

test("valid footnotes and lists preserve semantic Markdown inside language blocks", async () => {
  const body = 'Text[^n]\n\n[^n]: <div class="bilingual-unit">\n\n    <div lang="en">\n\n    - Original\n\n    </div>\n\n    <div lang="zh-CN">\n\n    - **译文**\n\n    </div>\n\n    </div>';
  assert.deepEqual(await checkBilingualFormat(body), []);
  const result = await (await createMarkdownProcessor({ syntaxHighlight: false })).render(body);
  assert.equal((result.code.match(/<a\b[^>]*\bdata-footnote-backref=/g) ?? []).length, 1);
  assert.equal((result.code.match(/<ul>/g) ?? []).length, 2);
});

test("rejects malformed language ordering and Chinese italic emphasis", async () => {
  const errors = await checkBilingualFormat('<div class="bilingual-unit">\n\n<div lang="zh-CN">\n\n*中文*\n\n</div>\n\n<div lang="en">\n\nEnglish\n\n</div>\n\n</div>');
  assert.equal(errors.length, 2);
});

test("code examples do not masquerade as unbalanced bilingual markup", async () => {
  const body = '<div class="bilingual-unit">\n\n<div lang="en">\n\n```html\n<div class="bilingual-unit">\n```\n\n</div>\n\n<div lang="zh-CN">\n\n正文\n\n</div>\n\n</div>';
  assert.deepEqual(await checkBilingualFormat(body), []);
});

test("wide tables keep cell contents and receive their actual column labels", async () => {
  const result = await (await createMarkdownProcessor({ syntaxHighlight: false, rehypePlugins: [rehypeRaw, rehypeBilingual] })).render('| A | B | C | D | E |\n| --- | --- | --- | --- | --- |\n| 1 | 2 | 3 | 4 | 5 |');
  assert.match(result.code, /class="bilingual-wide-table"/);
  for (const [label, value] of [['A', '1'], ['B', '2'], ['C', '3'], ['D', '4'], ['E', '5']]) {
    assert.match(result.code, new RegExp(`<td data-label="${label}">${value}</td>`));
  }
});


test("raw HTML tables expand combined headings into accurate mobile labels", async () => {
  const result = await (await createMarkdownProcessor({ syntaxHighlight: false, rehypePlugins: [rehypeRaw, rehypeBilingual] })).render('<table><thead><tr><th rowspan="2">System<br>系统</th><th colspan="4">Scores</th></tr><tr><th>A</th><th>B</th><th>C</th><th>D</th></tr></thead><tbody><tr><td>X</td><td colspan="2">12</td><td>3</td><td>4</td></tr></tbody></table>');
  assert.match(result.code, /class="bilingual-wide-table"/);
  assert.match(result.code, /data-label="System \/ 系统"/);
  assert.match(result.code, /data-label="Scores \/ A; Scores \/ B">12/);
  assert.match(result.code, /data-label="Scores \/ D">4/);
});

test("English TOC aliases preserve original bilingual heading IDs and distinct repeats", async () => {
  const result = await (await createMarkdownProcessor({ syntaxHighlight: false, rehypePlugins: [rehypeRaw, rehypeBilingual] })).render('## Controller behavior｜控制器行为\n\n## Controller behavior｜控制器行为');
  assert.deepEqual(result.metadata.headings.map(h => h.slug), ['controller-behavior控制器行为', 'controller-behavior控制器行为-1']);
  assert.match(result.code, /<span id="controller-behavior"/);
  assert.match(result.code, /<span id="controller-behavior-1"/);
});

test("formula scrolling preserves the TeX source", async () => {
  const result = await (await createMarkdownProcessor({ syntaxHighlight: false, remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex, rehypeRaw, rehypeBilingual] })).render('$$\nA_{original}=B^2\n$$');
  assert.match(result.code, /class="katex bilingual-math"/);
  assert.match(result.code, /A_\{original\}=B\^2/);
});
