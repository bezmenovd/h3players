import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import { getMe, Restriction } from '../api/user';
import { timestamp } from '../helpers/timestamp';

export const useUserStore = defineStore('user', () => {
    const token = ref<string|null>(localStorage.getItem('user:token'))
    const player = reactive<{
        id: number|null,
        name: string|null,
    }>({
        id: null,
        name: null,
    })
    const blacklist = ref<number[]>([])
    const permissions = ref<string[]>([])
    const restriction = ref<Restriction|null>(null)
    const authorized = ref(false)


    async function setToken(value: string) {
        token.value = value
        localStorage.setItem('user:token', token.value)

        load()
    }

    async function logout() {
        localStorage.removeItem('user:token')

        location.reload()
    }

    async function load() {
        getMe().then(p => {
            authorized.value = true
            player.id = p.id
            player.name = p.name
            permissions.value = p.permissions
            restriction.value = p.restriction
            blacklist.value = p.blacklist
        }).catch(() => {})
    }

    function hasPermission(permission: string): boolean {
        return permissions.value?.includes(permission) ?? false
    }

    const hasNoRestriction = computed<boolean>(() => {
        return ! restriction.value || restriction.value!.finish_at < timestamp.now()
    })

    const isAuthenticated = computed(() => authorized.value)

    return {
        token,
        player,
        blacklist,
        restriction,
        permissions,
        isAuthenticated,
        hasPermission,
        hasNoRestriction,
        setToken,
        logout,
        load,
    }
})
