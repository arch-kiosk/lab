import { expect, test } from "vite-plus/test"
import { PluginManager } from "../src"

test("init plugin manager", () => {
  expect(new PluginManager())
})
