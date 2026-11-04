import { copyFileSync } from "node:fs";
import { sitePaths } from "./src/site-pages-data.js";
import { resourcePaths } from "./src/resources-data.js";
import { defineConfig } from "vite";

// Serve the pre-rendered document at its canonical (extensionless) URL too.
function serviceDocument(server) {
  server.middlewares.use((request, response, next) => {
    const [pathname, query] = (request.url || "").split("?");
    const servicePath = pathname.replace(/\/$/, "");
    if (pathname === "/") {
      request.url = `/home/index.html${query ? `?${query}` : ""}`;
      return next();
    }
    if (
      [
        "/about",
        "/about/our-purpose",
        "/about/our-team",
        "/about/sustainability",
      ].includes(servicePath)
    ) {
      request.url = `/about/index.html${query ? `?${query}` : ""}`;
      return next();
    }
    if (
      [
        ...resourcePaths,
        ...sitePaths.filter((path) => path !== "/"),
        "/employers",
        "/apply",
        "/code-of-conduct",
        "/popia-notice",
        "/services/rpl",
        "/services/external-hr-management",
        "/services/driver-recruitment",
      ].includes(servicePath)
    )
      request.url = `${servicePath}/index.html${query ? `?${query}` : ""}`;
    next();
  });
}

export default defineConfig({
  plugins: [
    {
      name: "service-static-documents",
      configureServer: serviceDocument,
      configurePreviewServer: serviceDocument,
      writeBundle(options) {
        // The root source remains the shared About shell; publish the compiled
        // Home document at / while keeping the complete About document at /about.
        copyFileSync(
          `${options.dir}/home/index.html`,
          `${options.dir}/index.html`,
        );
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        home: "home/index.html",
        about: "about/index.html",
        ...Object.fromEntries(
          ["our-purpose", "our-team", "sustainability"].map((slug, i) => [
            `aboutAlias${i}`,
            `about/${slug}/index.html`,
          ]),
        ),
        ...Object.fromEntries(
          sitePaths
            .filter((path) => path !== "/")
            .map((path, i) => [`site${i}`, `${path.slice(1)}/index.html`]),
        ),
        ...Object.fromEntries(
          resourcePaths.map((path, i) => [
            `resource${i}`,
            `${path.slice(1)}/index.html`,
          ]),
        ),
        apply: "apply/index.html",
        employers: "employers/index.html",
        popia: "popia-notice/index.html",
        conduct: "code-of-conduct/index.html",
        rpl: "services/rpl/index.html",
        hr: "services/external-hr-management/index.html",
        driver: "services/driver-recruitment/index.html",
      },
    },
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: [".e2b.app"],
    fs: {
      deny: [
        ".env",
        ".env.*",
        "**/*.enc",
        "**/.test-key",
        "**/.application-data/**",
      ],
    },
    proxy: { "/api": { target: "http://127.0.0.1:3001", changeOrigin: false } },
  },
  preview: {
    host: "0.0.0.0",
    allowedHosts: [".e2b.app"],
    proxy: { "/api": { target: "http://127.0.0.1:3001", changeOrigin: false } },
  },
});
