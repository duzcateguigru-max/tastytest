import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPersistedstate from 'pinia-plugin-persistedstate'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

import App from './App.vue'
import router from './router'
import './assets/main.css'

const pinia = createPinia()
pinia.use(piniaPersistedstate)

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(Toast, {
  position: 'bottom-right',
  timeout: 3500,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
})

app.mount('#app')
