import { defineConfig } from "vitepress";
import { set_sidebar } from "./utils/auto_sidebar";
// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/docs-xy/",
  title: "桃花源",
  description: "筱宇工作室",
  head: [["link", { rel: "icon", href: "/docs-xy/logo.png" }]],
  themeConfig: {
    outlineTitle: "目录",
    outline: [2, 6],
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {
        text: "主页",
        link: "/",
        // items: [
        //   { text: '红丸分享', link: '/about' },
        //   { text: '前端技术', link: '/about' },
        // ]
      },
      { text: "红丸分享", link: "/red-pill/chasup-master" },
      { text: "前端技术", link: "/front-end/vue" },
      { text: "Python", link: "/python/crawler" },
      { text: "身体健康", link: "/healthy-life/body" },
    ],

    // sidebar: [
    //   {
    //     text: 'Examples',
    //     items: [
    //       { text: 'Markdown Examples', link: '/markdown-examples' },
    //       { text: 'Runtime API Examples', link: '/api-examples' }
    //     ]
    //   }
    // ],
    sidebar: {
      "/red-pill/chasup-master": set_sidebar("/red-pill/chasup-master"),
      "/front-end/vue": set_sidebar("/front-end/vue"),
      "/python/crawler": set_sidebar("/python/crawler"),
      "healthy-life/body": set_sidebar("/healthy-life/body"),
    },

    socialLinks: [{ icon: "github", link: "https://github.com/qq2861793863" }],
    footer: {
      copyright: "Copyright © 2024 筱宇工作室",
    },
    // 设置搜索框的样式
    search: {
      provider: "local",
      options: {
        translations: {
          button: {
            buttonText: "搜索文档",
            buttonAriaLabel: "搜索文档",
          },
          modal: {
            noResultsText: "无法找到相关结果",
            resetButtonTitle: "清除查询条件",
            footer: {
              selectText: "选择",
              navigateText: "切换",
            },
          },
        },
      },
    },
  },
});
