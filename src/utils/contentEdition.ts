import { getAssetPath, stripBase, stripLocale } from "./withBase";

export function isEnglishEdition(pathname: string) {
  return /^\/en(?:\/|$)/.test(stripBase(pathname));
}

export function englishPath(path: string) {
  return getAssetPath(
    `en/${path.replace(/^\/+|\/+$/g, "")}`.replace(/\/?$/, "/")
  );
}

export function editionRoutes(pathname: string) {
  const path = stripLocale(stripBase(pathname), "en").replace(/\/+$/, "");
  if (
    path === "" ||
    /^\/(jottings|posts|reposts|search)$/.test(path) ||
    /^\/posts\/\d+$/.test(path)
  ) {
    return {
      original: getAssetPath(path ? `${path}/` : ""),
      english: englishPath(path),
      paired: true,
    };
  }
  // The English archives are single pages, so a filter view opens its archive.
  const archive = path.match(/^\/(posts|reposts)(?:\/|$)/)?.[1];
  return archive
    ? {
        original: getAssetPath(`${archive}/`),
        english: englishPath(archive),
        paired: false,
      }
    : null;
}
