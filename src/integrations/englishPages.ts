import type { AstroIntegration } from "astro";
import { readdirSync } from "node:fs";

export function englishPages(): AstroIntegration {
  return {
    name: "english-pages",
    hooks: {
      "astro:config:setup": ({ config, injectRoute }) => {
        function addPages(directory: URL, path: string) {
          for (const entry of readdirSync(directory, { withFileTypes: true })) {
            if (entry.name.startsWith("_") || entry.name.startsWith("."))
              continue;

            if (entry.isDirectory()) {
              addPages(
                new URL(`${entry.name}/`, directory),
                `${path}/${entry.name}`
              );
            } else if (entry.isFile() && entry.name.endsWith(".astro")) {
              const name = entry.name.slice(0, -".astro".length);
              injectRoute({
                pattern: name === "index" ? path : `${path}/${name}`,
                entrypoint: new URL(entry.name, directory),
              });
            }
          }
        }

        // Each edition renders the route's existing page, including its static paths.
        addPages(new URL("pages/", config.srcDir), "/en");
      },
    },
  };
}
