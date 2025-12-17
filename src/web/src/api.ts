import axios from 'axios'
import { useUserStore } from './stores/user'
import { alerts } from './components/UI/alerts'
import { useSettingsStore } from './stores/settings'

const api = axios.create({
    baseURL: window.location.origin + '/api/',
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json'
    }
})

api.interceptors.request.use((config) => {
    const userStore = useUserStore()
    const settingsStore = useSettingsStore()
    
    if (userStore.token) {
        config.headers['Token'] = userStore.token
    }
    if (settingsStore.language) {
        config.headers['Language'] = settingsStore.language
    }
    
    return config
}, (error) => {
    return Promise.reject(error)
})

export default api
