import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
    const token = ref<string|null>(null)

    const isAuthenticated = computed(() => token.value !== null)

    async function setToken(value: string) {
        token.value = value
    }

    return {
        token,
        isAuthenticated,
        setToken,
    }
})
