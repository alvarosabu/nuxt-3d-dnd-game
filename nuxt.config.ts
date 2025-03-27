// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '../nuxt/src', // @tresjs/nuxt local PR
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/content',
    'pinia-plugin-persistedstate/nuxt',
    'nuxt-svgo',
  ],
  css: ['~/assets/css/main.css'],
  devServer: {
    https: true,
  },
  /*  server: {
    host: '0.0.0.0',
    port: 3000
  }, */
  future: {
    compatibilityVersion: 4,
  },
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
