import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useNavigationStore = defineStore('navigation', () => {
  const routes = ref<{ name: string, path: string, params?: object }[]>([])
  const previous = computed<{ name: string, path: string, params?: object }|null>(() => {
    return routes.value.length > 0 ? routes.value[routes.value.length-1] : null
  })
  
  function push(route: { name: string, path: string, params?: object }) {
    routes.value.push(route)
    console.log('after push', JSON.parse(JSON.stringify(routes.value)).map(i => i.name))
  }

  function pop() {
    routes.value.pop()
    console.log('after pop', JSON.parse(JSON.stringify(routes.value)).map(i => i.name))
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
