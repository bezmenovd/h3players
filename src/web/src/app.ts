import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import { i18n, setupI18n } from './i18n'
import axios from 'axios'
import App from './App.vue'
import './css/h3.css'

// Setup axios defaults
axios.defaults.baseURL = window.location.origin
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
axios.defaults.headers.common['Accept'] = 'application/json'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)

setupI18n()

app.mount('#root')
