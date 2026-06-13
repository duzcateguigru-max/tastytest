<template>
  <div class="auth-page">
    <div class="auth-bg"><div class="auth-glow"></div></div>
    <div class="auth-card glass-card">
      <div class="auth-header">
        <RouterLink to="/" class="auth-logo">🍽️ FlavorHaven</RouterLink>
        <h2>Create Account</h2>
        <p>Join us for a delicious experience</p>
      </div>
      <form @submit.prevent="handleRegister" class="auth-form" novalidate>
        <div class="form-grid">
          <div class="input-group">
            <label class="input-label">First Name</label>
            <input v-model="form.first_name" class="input" placeholder="John" id="reg-fname" />
          </div>
          <div class="input-group">
            <label class="input-label">Last Name</label>
            <input v-model="form.last_name" class="input" placeholder="Doe" id="reg-lname" />
          </div>
        </div>
        <div class="input-group">
          <label class="input-label">Email</label>
          <input v-model="form.email" type="email" class="input" :class="{ error: errors.email }" placeholder="you@example.com" id="reg-email" />
          <span v-if="errors.email" class="input-error">{{ errors.email }}</span>
        </div>
        <div class="input-group">
          <label class="input-label">Phone</label>
          <input v-model="form.telephone" type="tel" class="input" placeholder="+1 (555) 000-0000" id="reg-phone" />
        </div>
        <div class="input-group">
          <label class="input-label">Password</label>
          <input v-model="form.password" type="password" class="input" :class="{ error: errors.password }" placeholder="At least 8 characters" id="reg-pass" autocomplete="new-password" />
          <span v-if="errors.password" class="input-error">{{ errors.password }}</span>
        </div>
        <div class="input-group">
          <label class="input-label">Confirm Password</label>
          <input v-model="form.password_confirmation" type="password" class="input" :class="{ error: errors.confirm }" placeholder="Repeat password" id="reg-pass-confirm" />
          <span v-if="errors.confirm" class="input-error">{{ errors.confirm }}</span>
        </div>
        <button type="submit" class="btn btn-primary btn-lg w-full" :disabled="loading" id="register-submit-btn">
          <span v-if="loading" class="spinner"></span>
          <span v-else>Create Account</span>
        </button>
        <span v-if="serverError" class="server-error">{{ serverError }}</span>
      </form>
      <div class="auth-footer">
        <span>Already have an account?</span>
        <RouterLink to="/login" class="text-primary">Sign in →</RouterLink>
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
const loading = ref(false)
const serverError = ref('')
const form = ref({ first_name:'', last_name:'', email:'', telephone:'', password:'', password_confirmation:'' })
const errors = ref({ email:'', password:'', confirm:'' })

function validate() {
  errors.value = { email:'', password:'', confirm:'' }
  if (!form.value.email) errors.value.email = 'Email is required'
  else if (!/\S+@\S+\.\S+/.test(form.value.email)) errors.value.email = 'Invalid email'
  if (form.value.password.length < 8) errors.value.password = 'Password must be at least 8 characters'
  if (form.value.password !== form.value.password_confirmation) errors.value.confirm = 'Passwords do not match'
  return !Object.values(errors.value).some(Boolean)
}

async function handleRegister() {
  if (!validate()) return
  loading.value = true
  serverError.value = ''
  try {
    await auth.register(form.value)
    await auth.login(form.value.email, form.value.password)
    toast.success('Welcome to FlavorHaven! 🎉')
    router.push('/')
  } catch (e: any) {
    serverError.value = e?.response?.data?.message ?? 'Registration failed'
  } finally { loading.value = false }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  position: relative; padding: var(--space-8);
}
.auth-bg { position: fixed; inset: 0; background: radial-gradient(ellipse at 50% 50%, rgba(245,158,11,0.08), transparent 70%), var(--color-bg); pointer-events: none; }
.auth-glow { position: absolute; top: 30%; left: 50%; transform: translate(-50%,-50%); width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%); }
.auth-card { position: relative; z-index: 1; width: 100%; max-width: 460px; padding: var(--space-8); display: flex; flex-direction: column; gap: var(--space-6); }
.auth-header { text-align: center; display: flex; flex-direction: column; gap: var(--space-3); }
.auth-logo { font-family: var(--font-heading); font-size: 1.3rem; font-weight: 700; display: inline-block; margin-bottom: var(--space-2); }
.auth-header h2 { font-size: 1.8rem; }
.auth-header p { font-size: 0.9rem; }
.auth-form { display: flex; flex-direction: column; gap: var(--space-4); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
.server-error { color: var(--color-secondary); font-size: 0.85rem; text-align: center; }
.auth-footer { display: flex; align-items: center; justify-content: center; gap: var(--space-2); font-size: 0.875rem; color: var(--color-text-2); }
</style>
