import { viteBundler } from '@vuepress/bundler-vite'
import { defineUserConfig } from 'vuepress'
import { plumeTheme } from 'vuepress-theme-plume'

const copyright = 'Copyright © ' + new Date().getFullYear() + '  <a href="hein.hp@foxmail.com" target=_blank>hein.hp@foxmail.com</a>'

export default defineUserConfig({
  base: '/',
  lang: 'zh-CN',
  title: 'GemengYin',
  description: '一个美丽的女孩',

  head: [
    ['link', { rel: 'icon', href: '/coffee-beans.png' }],
  ],

  bundler: viteBundler(),

  theme: plumeTheme({
    footer: {
      message: '',
      copyright: copyright
    },

    blog: {
      postList: false,
      categories: false,
      tagsLink: '/tags/',
      archivesLink: '/archives/',
    },
    
    plugins: {
      shiki: {
        languages: ['shell', 'bash', 'javascript', 'java', 'c++', 'xml'],
      },

      markdownEnhance: {
        include: true,
        mermaid: true,
      },

      markdownPower: {
        pdf: true,
        caniuse: true,
        plot: true,
        bilibili: true,
        youtube: true,
        icons: true,
        codepen: true,
        replit: true,
        codeSandbox: true,
        jsfiddle: true,
        repl: {
          go: true,
          rust: true,
          kotlin: true,
        },
      },

      /**
       * 评论 comments
       */
      comment: {
        provider: 'Giscus',
        comment: true,
        repo: 'hein-hp/giscus', 
        repoId: 'R_kgDONQTFng', 
        category: 'Announcements', 
        categoryId: 'DIC_kwDONQTFns4CkU1V', 
      },
    },
  }),
})
