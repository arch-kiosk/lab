// noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols

import { defineConfig } from "vite-plus";
import { resolve } from "path";
// import dts from 'vite-plugin-dts'
import packageJson from "./package.json";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // const env = loadEnv(mode, "env");
  const _a = mode || null; // just suppressing a linter error until mode is used

  return {
    build: {
      copyPublicDir: false,
      outDir: "./dist",
      emptyOutDir: true,
      minify: true,
      lib: {
        entry: resolve(__dirname, "src/ui-component.ts"),
        name: "UIComponent",
        filename: "uicomponent",
        formats: ["es"],
      },
      rolldownOptions: {
        // external: [/^lit/,"@polymer/polymer",/^polymer/,/^@polymer/,/^@vaadin/]
        external: /^[^./](?!:[/\\])/,
        output: {
          minify:
            command === "build"
              ? {
                  compress: {
                    dropConsole: true,
                    dropDebugger: true,
                  },
                }
              : undefined,
        },
        //   external: (id) =>
        //       // Externalize all npm packages but keep local files
        //       !id.startsWith('.') && !id.startsWith('/') && !id.startsWith('\0') && !id.match(/^[A-Za-z]:/)
      },
      // sourcemap: 'inline'
    },
    // Gemini addition, not sure it is necessary:
    // css: {
    //   devSourcemap: true
    // },
    server: {
      // sourcemap: true,
      port: 5174,
      fs: {
        strict: true,
        host: true,
        // allow: [searchForWorkspaceRoot(process.cwd()), "../../../static/scripts/kioskapplib"],
      },
    },
    // plugins: [],
    define: {
      "import.meta.env.PACKAGE_VERSION": JSON.stringify(packageJson.version),
    },

    // publicDir: "/public/static"
  };
});
