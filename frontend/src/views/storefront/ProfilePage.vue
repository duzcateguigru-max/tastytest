<template>
  <div class="profile-page">
    <div class="container" style="max-width: 700px;">
      <h1>Mi <span class="text-gradient">Perfil</span></h1>
      <div class="profile-card glass-card">
        <div class="profile-avatar">{{ auth.fullName.charAt(0) || 'U' }}</div>
        <div class="profile-name">{{ auth.fullName || 'User' }}</div>
        <div class="profile-email">{{ auth.user?.email }}</div>
      </div>
      <div class="profile-form glass-card">
        <h3>Datos de la Cuenta</h3>
        <div class="form-grid">
          <div class="input-group">
            <label class="input-label">Nombre</label>
            <input v-model="form.first_name" class="input" />
          </div>
          <div class="input-group">
            <label class="input-label">Apellido</label>
            <input v-model="form.last_name" class="input" />
          </div>
        </div>
        <div class="input-group">
          <label class="input-label">Teléfono</label>
          <input v-model="form.telephone" class="input" type="tel" />
        </div>
        <button class="btn btn-primary" @click="save" :disabled="saving" id="save-profile-btn">
          <span v-if="saving" class="spinner"></span>
          <span v-else>Guardar Cambios</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { customersApi } from '@/services/api'
import { useToast } from 'vue-toastification'

const auth = useAuthStore()
const toast = useToast()
const saving = ref(false)
const form = ref({ first_name: auth.user?.first_name ?? '', last_name: auth.user?.last_name ?? '', telephone: auth.user?.telephone ?? '' })

watch(() => auth.user, (u) => {
  if (u) { form.value.first_name = u.first_name; form.value.last_name = u.last_name; form.value.telephone = u.telephone ?? '' }
})

async function save() {
  if (!auth.user) return
  saving.value = true
  try {
    await customersApi.update(auth.user.id, form.value)
    await auth.fetchMe()
    toast.success('¡Perfil actualizado!')
  } catch { toast.error('Error al actualizar el perfil') }
  finally { saving.value = false }
}
</script>

<style scoped>
.profile-page { padding: var(--space-12) 0 var(--space-16); }
.profile-page h1 { margin-bottom: var(--space-8); }
.profile-card {
  padding: var(--space-8); text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: var(--space-3);
  margin-bottom: var(--space-6);
}
.profile-avatar {
  width: 80px; height: 80px; border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: var(--color-text-invert); font-size: 2rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  box-shadow: var(--shadow-glow);
}
.profile-name { font-size: 1.4rem; font-weight: 700; font-family: var(--font-heading); }
.profile-email { font-size: 0.875rem; color: var(--color-text-3); }
.profile-form { padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-5); }
.profile-form h3 { font-family: var(--font-heading); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
</style>
