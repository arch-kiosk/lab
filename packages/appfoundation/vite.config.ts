import { defineConfig } from "vite-plus"
import { resolve } from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      // Replaces the tracking library with an empty module.
      // Rollup will tree-shake this into nothingness for the production build.
      '@vaadin/vaadin-usage-statistics/vaadin-usage-statistics.js': '',
      '@vaadin/vaadin-usage-statistics': ''
    }
  },
  pack: {
    entry: {
      index: resolve(__dirname, 'src/index.ts'),
      'dataprovider/index': resolve(__dirname, 'src/dataprovider/index.ts'),
    },
    dts: {
      // tsgo: true,
    },
    exports: false,
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
})
