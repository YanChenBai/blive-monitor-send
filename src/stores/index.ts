import { createPinia, defineStore } from 'pinia'
import persistedstate from 'pinia-plugin-persistedstate'
import { ref } from 'vue'

const pinia = createPinia().use(persistedstate)

export const useConfigStore = defineStore(
  'config',
  () => {
    const ip = ref<string>()
    const token = ref<string>()

    return {
      ip,
      token
    }
  },
  {
    persist: {
      // paths: ['ip', 'token']
    }
  }
)

export default pinia
