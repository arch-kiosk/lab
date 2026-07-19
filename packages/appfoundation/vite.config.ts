import { defineConfig } from "vite-plus"

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
    dts: {
      // tsgo: true,
    },
    exports: true,
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
})
