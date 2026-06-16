<template>
  <div class="auth-page">
    <div class="auth-bg">
      <div class="auth-glow"></div>
    </div>
    <div class="auth-card glass-card">
      <div class="auth-header">
        <RouterLink to="/" class="auth-logo">🍽️ FlavorHaven</RouterLink>
        <h2>Bienvenido</h2>
        <p>Inicia sesión en tu cuenta</p>
      </div>
      <form @submit.prevent="handleLogin" class="auth-form" novalidate>
        <div class="input-group">
          <label class="input-label" for="login-email">Correo Electrónico</label>
          <input id="login-email" v-model="email" type="email" class="input" :class="{ error: errors.email }" placeholder="tu@ejemplo.com" autocomplete="email" />
          <span v-if="errors.email" class="input-error">{{ errors.email }}</span>
        </div>
        <div class="input-group">
          <label class="input-label" for="login-password">Contraseña</label>
          <div class="password-field">
            <input id="login-password" v-model="password" :type="showPass ? 'text' : 'password'" class="input" :class="{ error: errors.password }" placeholder="••••••••" autocomplete="current-password" />
            <button type="button" class="toggle-pass" @click="showPass = !showPass" aria-label="Toggle password visibility">
              {{ showPass ? '🙈' : '👁️' }}
            </button>
          </div>
          <span v-if="errors.password" class="input-error">{{ errors.password }}</span>
        </div>
        <button type="submit" class="btn btn-primary btn-lg w-full" :disabled="auth.loading" id="login-submit-btn">
          <span v-if="auth.loading" class="spinner"></span>
          <span v-else>Iniciar Sesión</span>
        </button>
        <span v-if="serverError" class="server-error">{{ serverError }}</span>
      </form>
      <div class="auth-footer">
        <span>¿No tienes cuenta?</span>
        <RouterLink to="/register" class="text-primary">Crear una →</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

const auth = useAuthStore()
const router = useRouter()
const toast = useToast()

const email = ref(''); const password = ref(''); const showPass = ref(false)
const errors = ref({ email: '', password: '' }); const serverError = ref('')

function validate() {
  errors.value = { email: '', password: '' }
  if (!email.value) errors.value.email = 'Email is required'
  else if (!/\S+@\S+\.\S+/.test(email.value)) errors.value.email = 'Invalid email'
  if (!password.value) errors.value.password = 'Password is required'
  return !errors.value.email && !errors.value.password
}

async function handleLogin() {
  if (!validate()) return
  serverError.value = ''
  try {
    await auth.login(email.value, password.value)
    toast.success(`Welcome back, ${auth.fullName}!`)
    router.push('/')
  } catch (e: any) {
    serverError.value = e?.response?.data?.message ?? 'Invalid email or password'
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  position: relative; padding: var(--space-8);
}
.auth-bg {
  position: fixed; inset: 0;
  background: radial-gradient(ellipse at 50% 50%, rgba(245,158,11,0.08), transparent 70%), var(--color-bg);
  pointer-events: none;
}
.auth-glow {
  position: absolute; top: 30%; left: 50%; transform: translate(-50%,-50%);
  width: 600px; height: 600px; border-radius: 50%;
  background: radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%);
}
.auth-card { position: relative; z-index: 1; width: 100%; max-width: 420px; padding: var(--space-10); display: flex; flex-direction: column; gap: var(--space-6); }
.auth-header { text-align: center; display: flex; flex-direction: column; gap: var(--space-3); }
.auth-logo { font-family: var(--font-heading); font-size: 1.3rem; font-weight: 700; display: inline-block; margin-bottom: var(--space-2); }
.auth-header h2 { font-size: 1.8rem; }
.auth-header p { font-size: 0.9rem; }
.auth-form { display: flex; flex-direction: column; gap: var(--space-4); }
.password-field { position: relative; }
.password-field .input { padding-right: 42px; width: 100%; }
.toggle-pass {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; font-size: 1.1rem;
}
.server-error { color: var(--color-secondary); font-size: 0.85rem; text-align: center; }
.auth-footer { display: flex; align-items: center; justify-content: center; gap: var(--space-2); font-size: 0.875rem; color: var(--color-text-2); }
</style>
