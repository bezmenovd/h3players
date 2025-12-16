import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import { i18n, setupI18n } from './i18n'
import App from './App.vue'
import './css/h3.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)

setupI18n()

app.mount('#root')
