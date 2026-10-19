import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { vuetify } from './plugins/vuetify'
import { createMuvdashRouter } from './router'

export function createMuvdashApp() {
  const app = createApp(App)
  const router = createMuvdashRouter()

  app.use(createPinia())
  app.use(router)
  app.use(vuetify)

  return { app, router }
}