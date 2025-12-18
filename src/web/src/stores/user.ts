import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import { getMe, Restriction } from '../api/user';
import { timestamp } from '../helpers/timestamp';

export const useUserStore = defineStore('user', () => {
    const token = ref<string|null>(localStorage.getItem('user:token'))
    const player = reactive<{
        id: number|null,
        name: string|null,
        permissions: string[],
        restriction: Restriction|null,
    }>({
        id: null,
        name: null,
        permissions: [],
        restriction: null,
    })

    token.value = '4c285ce1c84e87053dd281a479d5bd7f'
    player.id = 1
    player.name = "Temnotta"

    async function setToken(value: string) {
        token.value = value
        localStorage.setItem('user:token', token.value)

        await getMe().then(p => {
            if (! p) {
                token.value = null
                return
            }

            player.id = p.id
            player.name = p.name
        }).catch(() => {})
    }

    async function logout() {
        localStorage.removeItem('user:token')

        location.reload()
    }

    async function load() {
        getMe().then(p => {
            if (! p) {
                token.value = null
                return
            }

            player.id = p.id
            player.name = p.name
            player.permissions = p.permissions
        }).catch(() => {})
    }

    function hasPermission(permission: string): boolean {
        return player.permissions.includes(permission)
    }

    function hasNoRestriction(): boolean {
        return player.restriction === null || player.restriction.finish_at < timestamp.now()
    }

    const isAuthenticated = computed(() => token.value !== null)

    return {
        token,
        player,
        isAuthenticated,
        hasPermission,
        hasNoRestriction,
        setToken,
        logout,
        load,
    }
})
