// docs/.vitepress/theme/index.mts
import DefaultTheme from "vitepress/theme";
// @ts-ignore
import "./custom.css"; // Import your custom overrides here

export default {
  extends: DefaultTheme,

  // @ts-ignore
  enhanceApp({ app, router, siteData }) {
    // You can also register global components here if needed later
  },
};
