// noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols

import { defineConfig } from 'vite'
import {resolve} from 'path'
import dts from 'vite-plugin-dts'
import packageJson from './package.json';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // const env = loadEnv(mode, "env");
  return {
    build: {
      copyPublicDir: false,
      outDir: "./dist",
      emptyOutDir: true,
      minify: true,
      lib: {
        entry: resolve(__dirname, 'src/ui-component.ts'),
        name: 'UIComponent',
        filename: 'uicomponent',
        formats: ['es'],
      },
      rollupOptions: {
        // external: [/^lit/,"@polymer/polymer",/^polymer/,/^@polymer/,/^@vaadin/]
        external: (id) =>
            // Externalize all npm packages but keep local files
            !id.startsWith('.') && !id.startsWith('/') && !id.startsWith('\0') && !id.match(/^[A-Za-z]:/)
      },
    },
    esbuild:
        command == "build"
            ? {
              //No console.logs in the distribution
              drop: ["console", "debugger"],
            }
            : {},
    server: {
      port: 5174,
      fs: {
        strict: true,
        host: true,
        // allow: [searchForWorkspaceRoot(process.cwd()), "../../../static/scripts/kioskapplib"],
      },
    },
    plugins: [dts({
      rollupTypes: true,
    })],
    define: {
      'import.meta.env.PACKAGE_VERSION': JSON.stringify(packageJson.version)
    },

    // publicDir: "/public/static"
}})
