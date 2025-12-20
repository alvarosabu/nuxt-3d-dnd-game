// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/devtools',
    '@tresjs/nuxt',
    '@nuxt/ui',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@vueuse/nuxt',
    '@nuxt/content',
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
  nitro: {
    experimental: {
      websocket: true,
    },
  },
})