import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNavigationStore = defineStore('navigation', () => {
  const routes = ref<{ name: string, path: string, params?: object }[]>([])
  const previous = computed<{ name: string, path: string, params?: object }|null>(() => {
    return routes.value.length > 0 ? routes.value[routes.value.length-1] : null
  })
  
  function push(route: { name: string, path: string, params?: object }) {
    routes.value.push(route)
  }

  function pop() {
    routes.value.pop()
  }

  function clear() {
    routes.value = []
  }

  return {
    routes,
    previous,
    push,
    pop,
    clear,
  }
})
