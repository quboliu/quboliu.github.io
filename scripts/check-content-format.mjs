import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const postsRoot = path.resolve("src/content/posts");
const errors = [];

const postFiles = fs
  .readdirSync(postsRoot, { withFileTypes: true })
  .filter(entry => entry.isDirectory() && /^\d+$/.test(entry.name))
  .flatMap(entry =>
    ["index.md", "index.mdx"]
      .map(file => path.join(postsRoot, entry.name, file))
      .filter(fs.existsSync)
  )
  .sort();

function report(file, line, message) {
  errors.push(
    `${path.relative(process.cwd(), file)}${line ? `:${line}` : ""} ${message}`
  );
}

function isExternalUrl(value) {
  return (
    /^[a-z][a-z\d+.-]*:/i.test(value) ||
    value.startsWith("/") ||
    value.startsWith("#")
  );
}

function checkLocalAsset(file, line, rawTarget) {
  if (!rawTarget || isExternalUrl(rawTarget)) return;

  let target = rawTarget.split(/[?#]/, 1)[0];
  try {
    target = decodeURIComponent(target);
  } catch {
    report(file, line, `contains an invalid encoded asset path: ${rawTarget}`);
    return;
  }

  const resolved = path.resolve(path.dirname(file), target);
  if (!fs.existsSync(resolved)) {
    report(file, line, `references a missing local asset: ${rawTarget}`);
  }
}

for (const file of postFiles) {
  const raw = fs.readFileSync(file, "utf8");
  const frontmatter = raw.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);

  if (!frontmatter) {
    report(file, 1, "is missing valid frontmatter");
    continue;
  }

  const frontmatterLines = frontmatter[1].split(/\r?\n/);
  const titleLine = frontmatterLines.find(line => /^title:\s*/.test(line));
  const descriptionLine = frontmatterLines.find(line =>
    /^description:\s*/.test(line)
  );
  if (!titleLine) report(file, 1, "is missing a title");
  if (!descriptionLine) {
    report(file, 1, "is missing a description");
  } else {
    const rawDescription = descriptionLine.replace(/^description:\s*/, "").trim();
    const description =
      rawDescription.length >= 2 &&
      rawDescription[0] === rawDescription.at(-1) &&
      /["']/.test(rawDescription[0])
        ? rawDescription.slice(1, -1)
        : rawDescription;
    const descriptionLength = [...description].length;

    if (descriptionLength < 8 || descriptionLength > 120) {
      report(
        file,
        frontmatterLines.indexOf(descriptionLine) + 2,
        `has a ${descriptionLength}-character description; use 8–120 characters`
      );
    }
    if (/^https?:\/\/\S+$/i.test(description)) {
      report(
        file,
        frontmatterLines.indexOf(descriptionLine) + 2,
        "uses a bare URL as its description"
      );
    }
  }

  const body = raw.slice(frontmatter[0].length);
  const bodyLines = body.split(/\r?\n/);
  const bodyLineOffset = (raw.slice(0, frontmatter[0].length).match(/\n/g) ?? [])
    .length;
  const headings = [];
  const visibleLines = [];
  const structureItems = [];
  let fence = null;
  let hasCode = false;

  for (let index = 0; index < bodyLines.length; index += 1) {
    const line = bodyLines[index];
    const absoluteLine = bodyLineOffset + index + 1;
    const fenceMatch = line.match(/^\s*(?:>\s*)*(`{3,}|~{3,})/);

    if (fenceMatch) {
      const marker = fenceMatch[1];
      if (!fence) {
        fence = { character: marker[0], length: marker.length };
        hasCode = true;
        structureItems.push({ type: "content", line: absoluteLine });
      } else if (
        marker[0] === fence.character &&
        marker.length >= fence.length
      ) {
        fence = null;
      }
      continue;
    }

    if (fence) continue;
    visibleLines.push({ line, absoluteLine });

    const heading = line.match(/^(#{1,6})[ \t]+(.+?)\s*#*\s*$/);
    if (heading) {
      const item = {
        level: heading[1].length,
        text: heading[2],
        line: absoluteLine,
      };
      headings.push(item);
      structureItems.push({ type: "heading", ...item });
    } else if (line.trim() && !/^---+$/.test(line.trim())) {
      structureItems.push({ type: "content", line: absoluteLine });
    }

    const scanLine = line.replace(/`[^`]*`/g, "");

    for (const image of scanLine.matchAll(
      /!\[([^\]]*)\]\((?:<([^>]+)>|([^\s)]+))/g
    )) {
      if (!image[1].trim()) {
        report(file, absoluteLine, "has an image without alt text");
      }
      checkLocalAsset(file, absoluteLine, image[2] ?? image[3]);
    }

    for (const image of scanLine.matchAll(/<img\b([^>]*?)>/gi)) {
      const attributes = image[1];
      const src = attributes.match(/\bsrc=["']([^"']+)["']/i)?.[1];
      const alt = attributes.match(/\balt=["']([^"']*)["']/i)?.[1];
      if (alt === undefined || !alt.trim()) {
        report(file, absoluteLine, "has an HTML image without alt text");
      }
      checkLocalAsset(file, absoluteLine, src);
    }

    if (/\{:\s*[^}]+}/.test(scanLine)) {
      report(file, absoluteLine, "contains an unrendered migration style attribute");
    }
    if (
      /^(?:>\s*)*(?:(?:[-*+]|\d+[.)])\s*)?$/.test(line.trim()) &&
      /[-*+\d]/.test(line)
    ) {
      report(file, absoluteLine, "contains an empty list item");
    }
    if (
      /^(?:>\s*)*(?:(?:[-*+]|\d+[.)])\s*)?x{3}[.…!！?？]*$/i.test(
        line.trim()
      )
    ) {
      report(file, absoluteLine, "contains an unfinished xxx placeholder");
    }
  }

  if (fence) report(file, bodyLines.length + bodyLineOffset, "has an unclosed code fence");

  if (headings[0]?.level > 2) {
    report(
      file,
      headings[0].line,
      `starts at H${headings[0].level}; article sections must start at H2`
    );
  }

  for (const heading of headings) {
    if (heading.level === 1) {
      report(
        file,
        heading.line,
        "contains a body H1; the page title already provides the only H1"
      );
    }
  }

  for (let index = 1; index < headings.length; index += 1) {
    const previous = headings[index - 1];
    const current = headings[index];
    if (current.level > previous.level + 1) {
      report(
        file,
        current.line,
        `jumps from H${previous.level} to H${current.level}`
      );
    }
  }

  for (let index = 0; index < structureItems.length; index += 1) {
    const item = structureItems[index];
    if (item.type !== "heading") continue;
    const next = structureItems[index + 1];
    if (!next || (next.type === "heading" && next.level <= item.level)) {
      report(file, item.line, `has an empty H${item.level} section`);
    }
  }

  const substantiveLines = visibleLines.filter(({ line }) => {
    const trimmed = line.trim();
    return trimmed && !/^---+$/.test(trimmed);
  });
  const quotedLines = substantiveLines.filter(({ line }) =>
    line.trimStart().startsWith(">")
  );
  if (
    substantiveLines.length >= 20 &&
    quotedLines.length / substantiveLines.length >= 0.8
  ) {
    report(
      file,
      substantiveLines[0].absoluteLine,
      "renders almost the entire article as a blockquote"
    );
  }

  const prose = visibleLines
    .map(({ line }) => line)
    .filter(line => !/^#{1,6}\s+/.test(line))
    .join("\n")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`>#|~-]/g, "")
    .trim();

  if (!hasCode && (!prose || /^(?:todo|tbd)[.…!！?？]*$/i.test(prose))) {
    report(file, bodyLineOffset + 1, "has no substantive article content");
  }
}

if (errors.length) {
  process.stderr.write(
    [
      `Content format check failed with ${errors.length} issue(s):`,
      ...errors.map(error => `- ${error}`),
      "",
    ].join("\n")
  );
  process.exitCode = 1;
} else {
  process.stdout.write(
    `Content format check passed for ${postFiles.length} posts.\n`
  );
}
