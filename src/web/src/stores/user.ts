import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getMe } from '../api/user';

export const useUserStore = defineStore('user', () => {
    const token = ref<string|null>(localStorage.getItem('user:token'))
    const player = ref<{
        id: number|null,
        name: string|null,
    }>({
        id: Number(localStorage.getItem('user:player:id')),
        name: localStorage.getItem('user:player:name'),
    })

    token.value = 'asdads'
    player.value.id = 1
    player.value.name = "Temnotta"

    if (token.value && (! player.value.id || ! player.value.name)) {
        getMe(token.value).then(p => {
            if (! p) {
                token.value = null
                return
            }

            player.value.id = p.id
            player.value.name = p.name
            localStorage.setItem('user:player:id', String(p.id))
            localStorage.setItem('user:player:name', p.name)
        }).catch(() => {})
    }

    async function setToken(value: string) {
        token.value = value
        localStorage.setItem('user:token', token.value)

        await getMe(token.value).then(p => {
            if (! p) {
                token.value = null
                return
            }

            player.value.id = p.id
            player.value.name = p.name
            localStorage.setItem('user:player:id', String(p.id))
            localStorage.setItem('user:player:name', p.name)
        }).catch(() => {})
    }

    async function logout() {
        localStorage.removeItem('user:token')
        localStorage.removeItem('user:player:id')
        localStorage.removeItem('user:player:name')

        location.reload()
    }

    const isAuthenticated = computed(() => token.value !== null)

    return {
        token,
        player,
        isAuthenticated,
        setToken,
        logout,
    }
})
