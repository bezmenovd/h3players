import { createI18n } from 'vue-i18n'
import ru from './locales/ru'
import en from './locales/en'
import pl from './locales/pl'
import { useSettingsStore } from './stores/settings'
import languages from './meta/languages.json'


export const i18n = createI18n({
    legacy: false,
    locale: 'en',
    fallbackLocale: 'ru',
    messages: {
        en,
        ru,
        pl
    }
})

export function setupI18n() {
    const settingsStore = useSettingsStore()

    // @ts-ignore
    i18n.global.locale.value = languages.find(l => l.id === settingsStore.language)?.code || 'en'
}

export default i18n
