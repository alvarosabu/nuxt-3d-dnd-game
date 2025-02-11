// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@tresjs/nuxt',
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/content',
  ],
  css: ['~/assets/css/main.css'],
  routeRules: {
    '/': {
      ssr: true,
    },
    '/campaign/**': { ssr: true },
    '/character/**': { ssr: false },
    '/game/**': {
      ssr: false,
    },
  },
  ui: {
    theme: {
      colors: ['primary', 'secondary'],
    },
  },
  nitro: {
    experimental: {
      websocket: true,
    },
  },
})
