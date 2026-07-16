import { defineConfig } from "vite-plus"
import oxlintConfig from "./oxlint.config"

export default defineConfig({
  run: {
    cache: true,
  },
  fmt: {
    semi: false,
  },
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    options: { typeAware: true, typeCheck: true },
    // oxlint-disable-next-line typescript/no-explicit-any
    rules: oxlintConfig.rules as Record<string, any>,
  },
})
