import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  telephone?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)

  const isLoggedIn = computed(() => !!user.value)
  const fullName = computed(() =>
    user.value
      ? `${user.value.first_name ?? ''} ${user.value.last_name ?? ''}`.trim() || user.value.email
      : '',
  )

  // Hydrate from Supabase session on startup
  supabase.auth.getSession().then(({ data }) => {
    if (data.session?.user) {
      const u = data.session.user
      user.value = {
        id: u.id,
        email: u.email ?? '',
        first_name: u.user_metadata?.first_name,
        last_name: u.user_metadata?.last_name,
      }
    }
  })

  // Keep in sync with Supabase auth state changes
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      const u = session.user
      user.value = {
        id: u.id,
        email: u.email ?? '',
        first_name: u.user_metadata?.first_name,
        last_name: u.user_metadata?.last_name,
      }
    } else {
      user.value = null
    }
  })

  async function login(email: string, password: string) {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      const u = data.user!
      user.value = {
        id: u.id,
        email: u.email ?? '',
        first_name: u.user_metadata?.first_name,
        last_name: u.user_metadata?.last_name,
      }
    } finally {
      loading.value = false
    }
  }

  async function register(data: { email: string; password: string; first_name?: string; last_name?: string }) {
    loading.value = true
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: { data: { first_name: data.first_name, last_name: data.last_name } },
      })
      if (error) throw error
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
  }

  return { user, loading, isLoggedIn, fullName, login, register, logout }
})
