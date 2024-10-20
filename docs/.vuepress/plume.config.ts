import { defineThemeConfig } from 'vuepress-theme-plume'
import { navbar } from './navbar'
import { notes } from './notes'

export default defineThemeConfig({
  logo: '/bat.svg',
  // your git repo url
  docsRepo: '',
  docsDir: 'docs',
  appearance: true,
  profile: {
    avatar: '/images/avator.jpg',
    name: 'Pika',
    description: '世界上最自然的语言',
    circle: true,
    // location: '',
    // organization: '',
  },
  navbar,
  notes,
  social: [
    { icon: 'github', link: 'https://github.com/hein-hp' },
  ],
})
