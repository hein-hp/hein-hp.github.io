import { defineNoteConfig, defineNotesConfig } from 'vuepress-theme-plume'

const structure = defineNoteConfig({
  dir: 'structure',
  link: '/structure',
  sidebar: 'auto'
})

const algo = defineNoteConfig({
  dir: 'algo',
  link: '/algo',
  sidebar: 'auto'
})

const test = defineNoteConfig({
  dir: 'test',
  link: '/test',
  sidebar: 'auto'
})

export const notes =  defineNotesConfig({
  dir: 'notes',
  link: '/',
  notes: [structure, algo, test],
})
