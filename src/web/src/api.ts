import axios from 'axios'
import { useUserStore } from './stores/user'
import { alerts } from './components/UI/alerts'
import { useSettingsStore } from './stores/settings'
import { getErrorMessage } from './helpers/errors'
import { contentLoader } from './components/UI/content_loader'

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

    if (config._contentLoader) {
        contentLoader.show()
    }
    
    return config
}, (error) => {
    return Promise.reject(error)
})

api.interceptors.response.use(
    (response) => {
        if (response.config._contentLoader) {
            contentLoader.hide()
        }

        return response;
    },
    (error) => {
        if (error.config._contentLoader) {
            contentLoader.hide()
        }

        if (error.config?._ignoreErrors) {
            return Promise.reject(error);
        }

        alerts.send('error', getErrorMessage(error, error.config?._errorsI18nPath), 5000);

        return Promise.reject(error);
    }
);

export default api
