import { defineConfig } from "vitepress"
import { generateSidebar } from "vitepress-sidebar"
export default defineConfig({
  title: "ui-component",
  base: "/lab/uicomponent/",
  description: "Render User Interfaces from JSON",
  themeConfig: {
    logo: "/assets/kiosk_spider.svg",
    nav: [
      { text: "Home", link: "/" },
      { text: "API Reference", link: "/api/" },
    ],
    sidebar: generateSidebar([
      {
        documentRootPath: "docs",
        scanStartPath: "api",
        resolvePath: "/api/",
        useTitleFromFileHeading: true,
        hyphenToSpace: true,
        capitalizeFirst: true,
      },
    ]),
  },
})
