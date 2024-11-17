import { defineNavbarConfig } from 'vuepress-theme-plume'

export const navbar = defineNavbarConfig([
  { text: 'Blog', link: '/', icon: 'material-symbols:receipt-long-outline' },
  { text: 'Tag', link: '/tags/', icon: 'mdi:tag' },
  { text: 'Archive', link: '/archives/', icon: 'material-symbols:event-note' },
  {
    text: 'Algo',
    items: [
      { text: 'structure', link: '/notes/structure/README.md', icon: 'mdi:audio-input-rca' },
      { text: 'algorithm', link: '/notes/algo/README.md', icon: 'mdi:file-code-outline' },
      { text: 'test', link: '/notes/test/README.md', icon: 'mdi:file-document-check' },
    ],
    icon: 'mdi:beehive-outline'
  },
])
