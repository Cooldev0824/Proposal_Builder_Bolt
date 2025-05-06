import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import App from './App.vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'

// Routes
import routes from './router'

// Global styles
import './assets/styles/main.scss'

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi
    }
  },
  theme: {
    themes: {
      light: {
        colors: {
          primary: '#0C84FE',
          secondary: '#05C2C9',
          accent: '#8A8D93',
          success: '#36B37E',
          warning: '#F59E0B',
          error: '#EF4444',
          'on-surface': '#1E1E1E'
        }
      }
    }
  }
})

const router = createRouter({
  history: createWebHistory(),
  routes
})

const pinia = createPinia()

createApp(App)
  .use(router)
  .use(vuetify)
  .use(pinia)
  .mount('#app')