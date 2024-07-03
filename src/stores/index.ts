import { createPinia, defineStore } from 'pinia'
import persistedstate from 'pinia-plugin-persistedstate'
import { ref } from 'vue'

const pinia = createPinia().use(persistedstate)

export const useConfigStore = defineStore(
  'config',
  () => {
    const ip = ref<string>()
    const token = ref<string>()
    const ssl = ref(false)

    return {
      ip,
      token,
      ssl
    }
  },
  {
    persist: {
      paths: ['ip', 'token', 'ssl']
    }
  }
)

export default pinia
