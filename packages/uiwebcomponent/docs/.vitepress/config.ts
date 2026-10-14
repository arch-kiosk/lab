import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar'
export default defineConfig({
    title: 'ui-component',
    base: '/lab/packages/uiwebcomponent/',
    description: 'Render User Interfaces from JSON',
    lastUpdated: true,
    head: [
        [
            'link',
            { rel: 'preconnect', href: 'https://fonts.googleapis.com' }
        ],
        [
            'link',
            { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }
        ],
        [
            'link',
            {
                rel: 'stylesheet',
                href: 'https://fonts.googleapis.com/css2?family=Kumbh+Sans:wght@100..900&display=swap'
            }
        ],
    ],
    // vitepressTypedoc: {
    //     // ...
    //     sort: ["source-order"],
    //     // Ensure required-first or kind sorting is not explicitly enabled elsewhere
    // },
    // tried this to get away from links that are either type-alias/ or interface/ but the side effects are horrible. Keep it just for reference.
    // rewrites: {
    //     'api/interfaces/:page(.*)': 'api/:page',
    //     'api/type-aliases/:page(.*)': 'api/:page'
    // },
    themeConfig: {
        logo: "/assets/kiosk_spider.svg",
        nav: [
            { text: "Home", link: "/" },
            { text: "API Reference", link: "/api/" },
        ],
        sidebar: generateSidebar([
            {
                documentRootPath: 'docs',
                scanStartPath: 'api',
                resolvePath: '/api/',
                useTitleFromFileHeading: true,
                hyphenToSpace: true,
                capitalizeFirst: true,
            },
        ]),
    },
})
