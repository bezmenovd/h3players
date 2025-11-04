import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<any>(null)
  const isAuthenticated = ref(false)

  // Getters
  const userName = computed(() => user.value?.name || 'Guest')

  // Actions
  function setUser(userData: any) {
    user.value = userData
    isAuthenticated.value = !!userData
  }

  function logout() {
    user.value = null
    isAuthenticated.value = false
  }

  return {
    user,
    isAuthenticated,
    userName,
    setUser,
    logout
  }
})
