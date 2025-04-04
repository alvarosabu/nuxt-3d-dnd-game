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
    'pinia-plugin-persistedstate/nuxt',
    'nuxt-svgo',
    '@nuxt/eslint',
  ],
  css: ['~/assets/css/main.css'],
  devServer: {
    https: false,
  },
  /*  server: {
    host: '0.0.0.0',
    port: 3000
  }, */
  routeRules: {
    '/': {
      ssr: false,
    },
    '/campaign/**': { ssr: true },
    '/character/**': { ssr: false },
    '/game/**': {
      ssr: false,
    },
    '/test': {
      ssr: false,
    },
  },
  ui: {
    theme: {
      colors: ['primary', 'secondary', 'success', 'error', 'warning'],
    },
  },
  nitro: {
    experimental: {
      websocket: true,
    },
  },
})