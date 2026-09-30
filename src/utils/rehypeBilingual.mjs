import Slugger from "github-slugger";

// Keep one semantic heading and its existing anchor when changing its layout.
// Full-width separators remain in the text used by Astro's heading collector.
export default function rehypeBilingual() {
  return tree => {
    const englishSlugs = new Slugger();
    const originalSlugs = new Slugger();
    const reservedIds = new Set();
    const aliases = [];
    function visit(node, inheritedLanguage) {
      const language = node.properties?.lang ?? inheritedLanguage;
      // English source titles/citations can sit inside Chinese editorial notes.
      // Mark their own language so they do not inherit the article's zh-CN.
      if (
        node.type === "element" &&
        ["em", "i"].includes(node.tagName) &&
        !language &&
        !/\p{Script=Han}/u.test(textOf(node))
      ) {
        node.properties ??= {};
        node.properties.lang = "en";
      }
      // A migrated translation of a formerly English-only heading is kept as
      // raw inline HTML so Astro retains the original heading slug and TOC text.
      // New headings can simply use English｜中文.
      for (let i = 1; i < (node.children ?? []).length; i++) {
        const child = node.children[i];
        const match =
          (child.type === "raw" || child.type === "comment") &&
          child.value.match(
            /^(?:<!--)?\s*bilingual-heading: ([\s\S]*?)\s*(?:-->)?$/
          );
        if (!match) continue;
        let previous = i - 1;
        while (
          previous >= 0 &&
          node.children[previous].type === "text" &&
          !node.children[previous].value.trim()
        )
          previous--;
        const heading = node.children[previous];
        if (heading?.type !== "element" || !/^h[1-6]$/.test(heading.tagName))
          continue;
        heading.properties ??= {};
        heading.properties.className = [
          ...(heading.properties.className ?? []),
          "bilingual-heading",
        ];
        heading.children = [
          {
            type: "element",
            tagName: "span",
            properties: { lang: "en" },
            children: heading.children,
          },
          {
            type: "raw",
            value: `<span class="heading-zh" lang="zh-CN">${match[1].replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>`,
          },
        ];
        node.children.splice(i, 1);
        i--;
      }
      const isHeading =
        node.type === "element" && /^h[1-6]$/.test(node.tagName);
      const isCaption =
        node.type === "element" &&
        node.tagName === "p" &&
        /^(?:Figure|Fig\.|Table)\s*[\dIVX]/i.test(textOf(node));
      const isBlockTitle =
        node.type === "element" &&
        node.tagName === "p" &&
        node.children.every(
          child =>
            child.tagName === "strong" ||
            (child.type === "text" && !child.value.trim())
        );
      if (isHeading || isCaption || isBlockTitle) {
        const parts = splitChildren(node.children);
        if (
          parts &&
          !/\p{Script=Han}/u.test(parts.before.map(textOf).join("")) &&
          (/\p{Script=Han}/u.test(parts.after.map(textOf).join("")) ||
            (isHeading && parts.separator === "｜"))
        ) {
          node.properties ??= {};
          node.properties.className = [
            ...(node.properties.className ?? []),
            isHeading
              ? "bilingual-heading"
              : isCaption
                ? "bilingual-caption"
                : "bilingual-block-title",
          ];
          node.children = [
            {
              type: "element",
              tagName: "span",
              properties: { lang: "en" },
              children: parts.before,
            },
            {
              type: "element",
              tagName: "span",
              properties: {
                className: ["bilingual-separator"],
                ariaHidden: "true",
              },
              children: [{ type: "text", value: parts.separator }],
            },
            {
              type: "element",
              tagName: "span",
              properties: {
                lang: "zh-CN",
                className: isHeading || isBlockTitle ? ["heading-zh"] : [],
              },
              children: parts.after,
            },
          ];
        }
      }
      if (node.properties?.id) reservedIds.add(node.properties.id);
      if (isHeading)
        reservedIds.add(
          node.properties?.id ?? originalSlugs.slug(headingText(node))
        );
      if (
        isHeading &&
        node.properties?.className?.includes("bilingual-heading")
      ) {
        const english = node.children.find(
          child => child.properties?.lang === "en"
        );
        if (english)
          aliases.push({
            id: englishSlugs.slug(textOf(english)),
            heading: node,
          });
      }
      if (
        node.type === "element" &&
        node.properties?.className?.includes("katex")
      ) {
        node.properties.className.push("bilingual-math");
      }
      if (node.type === "element" && node.tagName === "li") {
        const containsTranslation = child =>
          (child.type === "raw" &&
            child.value.includes('class="list-translation"')) ||
          child.properties?.className?.includes("list-translation") ||
          (child.children ?? []).some(containsTranslation);
        if (node.children.some(containsTranslation)) {
          node.properties ??= {};
          node.properties.lang = "en";
          node.properties.className = [
            ...(node.properties.className ?? []),
            "bilingual-list-unit",
          ];
        }
      }
      if (node.type === "element" && node.tagName === "table") {
        const header = node.children.find(child => child.tagName === "thead");
        // Expand multi-level column headings, including rowspan/colspan.
        const grid = [];
        for (const [r, row] of (
          header?.children.filter(child => child.tagName === "tr") ?? []
        ).entries()) {
          grid[r] ??= [];
          let c = 0;
          for (const cell of row.children.filter(
            child => child.tagName === "th"
          )) {
            while (grid[r][c] !== undefined) c++;
            const rows = Number(cell.properties?.rowSpan ?? 1);
            const cols = Number(cell.properties?.colSpan ?? 1);
            for (let y = r; y < r + rows; y++) {
              grid[y] ??= [];
              for (let x = c; x < c + cols; x++) grid[y][x] = textOf(cell);
            }
            c += cols;
          }
        }
        const labels = (grid[0] ?? []).map((_, c) =>
          [...new Set(grid.map(row => row[c]).filter(Boolean))].join(" / ")
        );
        if (labels.length > 4) {
          node.properties ??= {};
          node.properties.className = [
            ...(node.properties.className ?? []),
            "bilingual-wide-table",
          ];
          for (const body of node.children.filter(
            child => child.tagName === "tbody"
          )) {
            const occupied = [];
            for (const [r, row] of body.children
              .filter(child => child.tagName === "tr")
              .entries()) {
              occupied[r] ??= [];
              let c = 0;
              for (const cell of row.children.filter(
                child => child.tagName === "td" || child.tagName === "th"
              )) {
                while (occupied[r][c]) c++;
                const cols = Number(cell.properties?.colSpan ?? 1);
                const rows = Number(cell.properties?.rowSpan ?? 1);
                cell.properties ??= {};
                cell.properties.dataLabel = labels
                  .slice(c, c + cols)
                  .join("; ");
                for (let y = r; y < r + rows; y++) {
                  occupied[y] ??= [];
                  for (let x = c; x < c + cols; x++) occupied[y][x] = true;
                }
                c += cols;
              }
            }
          }
        }
      }
      for (const child of node.children ?? [])
        visit(child, node.properties?.lang ?? language);
    }
    function textOf(node) {
      if (node.tagName === "br") return " / ";
      return node.value ?? (node.children ?? []).map(textOf).join("");
    }
    function headingText(node) {
      if (node.type === "raw" || node.type === "comment") return "";
      return node.value ?? (node.children ?? []).map(headingText).join("");
    }
    function splitChildren(children) {
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.type === "text") {
          const match = child.value.match(/^(.*?)(｜|\s\/\s)([\s\S]*)$/);
          if (match)
            return {
              before: [
                ...children.slice(0, i),
                { type: "text", value: match[1] },
              ],
              separator: match[2],
              after: [
                { type: "text", value: match[3] },
                ...children.slice(i + 1),
              ],
            };
        } else if (child.children && child.tagName !== "code") {
          const parts = splitChildren(child.children);
          if (parts)
            return {
              before: [
                ...children.slice(0, i),
                { ...child, children: parts.before },
              ],
              separator: parts.separator,
              after: [
                { ...child, children: parts.after },
                ...children.slice(i + 1),
              ],
            };
        }
      }
      return null;
    }
    visit(tree);
    // Empty anchors do not enter Astro's heading text/slug collection.
    // Keep original mixed-language anchors while repairing English-only TOCs.
    for (const { id, heading } of aliases) {
      if (!id || reservedIds.has(id)) continue;
      reservedIds.add(id);
      heading.children.unshift({
        type: "element",
        tagName: "span",
        properties: { id, className: ["bilingual-anchor-alias"] },
        children: [],
      });
    }
  };
}
