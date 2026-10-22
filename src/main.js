
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Importar Vuetify
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

// Configuración de Vuetify
const vuetify = createVuetify({
  components,
  directives,

  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },

  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#273B66',
          secondary: '#8057D9',
          background: '#F4F6FA',
          surface: '#FFFFFF',
        },
      },
    },
  },
})

// Crear aplicación Vue
const app = createApp(App)

// Activar Vue Router
app.use(router)

// Activar Vuetify
app.use(vuetify)

// Montar aplicación
app.mount('#app')
