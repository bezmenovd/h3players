import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { RouteLocationRaw } from 'vue-router'

export const useNavigationStore = defineStore('navigation', () => {
  const returnPage = ref<RouteLocationRaw|null>(null)
  
  function setReturnPage(route: RouteLocationRaw) {
    returnPage.value = route
  }

  function clearReturnPage() {
    returnPage.value = null
  }

  return {
    returnPage,
    setReturnPage,
    clearReturnPage,
  }
})
