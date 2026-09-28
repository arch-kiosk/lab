// noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols

import { defineConfig } from "vite-plus"
import { resolve } from "path"
// import dts from 'vite-plugin-dts'
import packageJson from "./package.json"

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // const env = loadEnv(mode, "env");
  const _a = mode || null // just suppressing a linter error until mode is used

  return {
    resolve: {

      alias: {
        // Directs the dev server to intercept the bare string and serve the raw TS source
        '@arch-kiosk/appfoundation': resolve(__dirname, '../appfoundation/src/index.ts'),
        '#src': resolve(__dirname, './src'),
      }
    },
    optimizeDeps: {
      // noDiscovery: true,
      // Force these packages to be bundled together as a single entry

      // exclude: [
      //   '@vaadin/field-base',
      //   '@vaadin/combo-box',
      //   '@vaadin/date-picker',
      //   '@vaadin/date-time-picker',
      // ]
    },
    build: {
      copyPublicDir: false,
      outDir: "./dist",
      emptyOutDir: true,
      minify: true,
      lib: {
        entry: resolve(__dirname, "src/virtualizerlab.ts"),
        name: "virtualizerlab",
        filename: (format: string) => `virtualizerlab.${format}.js`,
        formats: ["es"],
      },
      rolldownOptions: {
        // external: [/^lit/,"@polymer/polymer",/^polymer/,/^@polymer/,/^@vaadin/]
        external: /^[^./](?!:[/\\])/,
        output: {
          minifyInternalExports: true,
        },
      },
    },
    server: {
      // sourcemap: true,
      port: 5174,
      fs: {
        strict: true,
        host: true,
        allow: [
          resolve(__dirname),
          resolve(__dirname, '../appfoundation')
        ]
        // allow: [searchForWorkspaceRoot(process.cwd()), "../../../static/scripts/kioskapplib"],
      },
    },
    // plugins: [],
    define: {
      "import.meta.env.PACKAGE_VERSION": JSON.stringify(packageJson.version)
    },

    // publicDir: "/public/static"
  }
})
