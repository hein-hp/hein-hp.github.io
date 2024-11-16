import { defineThemeConfig } from 'vuepress-theme-plume'
import { navbar } from './navbar'
import { notes } from './notes'

export default defineThemeConfig({
  logo: '/coffee-beans.png',
  docsRepo: '',
  docsDir: 'docs',
  appearance: true,
  profile: {
    avatar: '/images/avator.jpg',
    name: 'GY',
    circle: true,
    location: '中国-杭州',
  },
  navbar,
  notes,
  social: [
    { icon: 'github', link: 'https://github.com/hein-hp' },
    { icon: 'instagram', link: 'https://www.instagram.com/pika.hjq/profilecard/?igsh=MXhiYnpqY2dweTB5eg=='},
  ],
})
