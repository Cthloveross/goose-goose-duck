// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
  ],

  vite: {
    plugins: [
      import('@tailwindcss/vite').then((m) => m.default()),
    ],
  },

  css: ['~/assets/css/main.css'],

  imports: {
    dirs: ['stores'],
  },

  // Allow JSON imports to resolve correctly
  typescript: {
    strict: true,
  },
})
