import { getRelativeLocaleUrl } from "astro:i18n";
import {
  getAssetPath,
  isEnglishEdition,
  stripBase,
  stripLocale,
} from "./withBase";

export { isEnglishEdition } from "./withBase";

export function getEditionLocale(pathname: string) {
  // A tag named "en" must not select the English edition of the site.
  return isEnglishEdition(pathname) ? "en" : "zh-CN";
}

export function originalEditionPath(pathname: string) {
  return stripLocale(stripBase(pathname), "en");
}

export function editionRoutes(pathname: string) {
  const path = originalEditionPath(pathname).replace(/^\/+|\/+$/g, "");
  if (path === "404" || path === "404.html") {
    return {
      original: getAssetPath("404.html"),
      english: getRelativeLocaleUrl("en", "404"),
    };
  }
  return {
    original: getRelativeLocaleUrl("zh-CN", path),
    english: getRelativeLocaleUrl("en", path),
  };
}
