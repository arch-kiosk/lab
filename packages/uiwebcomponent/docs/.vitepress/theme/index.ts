// docs/.vitepress/theme/index.mts
import DefaultTheme from "vitepress/theme"
// @ts-ignore
import "./custom.css" // Import your custom overrides here

export default {
  extends: DefaultTheme,

  // @ts-ignore
  enhanceApp() {
    // You can also register global components here if needed later
  },
}
