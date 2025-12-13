import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import languages from '../meta/languages.json'


export const useSettingsStore = defineStore('settings', () => {
    const language = ref<number>(Number(localStorage.getItem('settings:language')) || languages[0].id)
    
    async function setLanguage(id: number) {
        language.value = id
        localStorage.setItem('settings:language', String(id))

        location.reload()
    }

    return {
        language,
        setLanguage,
    }
})
