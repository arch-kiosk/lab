import { defineConfig } from "vitepress"
import { generateSidebar } from "vitepress-sidebar"
export default defineConfig({
  title: "appfoundation",
  base: "/lab/packages/appfoundation",
  description: "Foundational Libraray for K67 Apps",
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
