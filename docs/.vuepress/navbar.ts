import { defineNavbarConfig } from 'vuepress-theme-plume'

export const navbar = defineNavbarConfig([
  { text: '首页', link: '/', icon: 'material-symbols:home'},
  { text: '博客', link: '/blog/', icon: 'material-symbols:receipt-long-outline' },
  { text: '标签', link: '/blog/tags/', icon: 'mdi:tag' },
  { text: '归档', link: '/blog/archives/', icon: 'material-symbols:event-note' },
  {
    text: '算法',
    items: [
      { text: '数据结构', link: '/notes/structure/README.md', icon: 'mdi:audio-input-rca' },
      { text: '算法', link: '/notes/algo/README.md', icon: 'mdi:file-code-outline' },
      { text: '刷题', link: '/notes/test/README.md', icon: 'mdi:file-document-check' },
    ],
    icon: 'mdi:beehive-outline'
  },
])
