import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/services/api'

export interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  telephone?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const loading = ref(false)

  const isLoggedIn = computed(() => !!token.value)
  const fullName = computed(() =>
    user.value ? `${user.value.first_name} ${user.value.last_name}` : '',
  )

  async function login(email: string, password: string) {
    loading.value = true
    try {
      const res = await authApi.login({ email, password })
      token.value = res.data.token ?? res.data.access_token
      localStorage.setItem('auth_token', token.value!)
      await fetchMe()
    } finally {
      loading.value = false
    }
  }

  async function register(data: object) {
    loading.value = true
    try {
      await authApi.register(data)
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try { await authApi.logout() } catch {}
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
  }

  async function fetchMe() {
    try {
      const res = await authApi.me()
      user.value = res.data.data ?? res.data
    } catch { /* not logged in */ }
  }

  if (token.value) fetchMe()

  return { user, token, loading, isLoggedIn, fullName, login, register, logout, fetchMe }
}, { persist: { pick: ['token'] } })
