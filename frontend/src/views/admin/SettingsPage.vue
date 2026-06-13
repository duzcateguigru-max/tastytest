<template>
  <div class="admin-settings">
    <h2>Configuración</h2>

    <div class="settings-grid">
      <!-- Restaurant Info -->
      <div class="settings-section glass-card">
        <div class="section-icon">🍽️</div>
        <h3>Información del Restaurante</h3>
        <div class="input-group">
          <label class="input-label">Nombre del Restaurante</label>
          <input v-model="settings.name" class="input" placeholder="FlavorHaven" />
        </div>
        <div class="input-group">
          <label class="input-label">Descripción</label>
          <textarea v-model="settings.description" class="input" rows="3" placeholder="Sobre tu restaurante..."></textarea>
        </div>
        <div class="input-group">
          <label class="input-label">Correo</label>
          <input v-model="settings.email" class="input" type="email" placeholder="hello@flavorhaven.com" />
        </div>
        <div class="input-group">
          <label class="input-label">Teléfono</label>
          <input v-model="settings.telephone" class="input" type="tel" placeholder="+1 (555) 123-4567" />
        </div>
        <button class="btn btn-primary" @click="saveSettings" :disabled="saving" id="save-info-btn">
          <span v-if="saving" class="spinner"></span>
          <span v-else>Guardar Información</span>
        </button>
      </div>

      <!-- Address & Hours -->
      <div class="settings-section glass-card">
        <div class="section-icon">📍</div>
        <h3>Dirección</h3>
        <div class="input-group">
          <label class="input-label">Dirección</label>
          <input v-model="settings.address" class="input" placeholder="123 Gourmet Ave" />
        </div>
        <div class="form-grid">
          <div class="input-group">
            <label class="input-label">Ciudad</label>
            <input v-model="settings.city" class="input" placeholder="Flavor City" />
          </div>
          <div class="input-group">
            <label class="input-label">Código Postal</label>
            <input v-model="settings.postcode" class="input" placeholder="10001" />
          </div>
        </div>
        <div class="input-group">
          <label class="input-label">País</label>
          <input v-model="settings.country" class="input" placeholder="United States" />
        </div>
        <button class="btn btn-primary" @click="saveSettings" :disabled="saving" id="save-address-btn">
          <span v-if="saving" class="spinner"></span>
          <span v-else>Guardar Dirección</span>
        </button>
      </div>

      <!-- Delivery Settings -->
      <div class="settings-section glass-card">
        <div class="section-icon">🚚</div>
        <h3>Ajustes de Entrega</h3>
        <div class="input-group">
          <label class="input-label">Pedido Mínimo ($)</label>
          <input v-model.number="settings.delivery_min" class="input" type="number" min="0" step="0.01" />
        </div>
        <div class="input-group">
          <label class="input-label">Cargo de Entrega ($)</label>
          <input v-model.number="settings.delivery_charge" class="input" type="number" min="0" step="0.01" />
        </div>
        <div class="input-group">
          <label class="input-label">Envío Gratis a partir de ($)</label>
          <input v-model.number="settings.free_delivery_above" class="input" type="number" min="0" step="0.01" />
        </div>
        <div class="toggle-setting">
          <span>Aceptar Pedidos</span>
          <button class="toggle-btn" :class="{ on: settings.open }" @click="settings.open = !settings.open" id="accept-orders-toggle">
            <span class="toggle-knob"></span>
          </button>
        </div>
        <button class="btn btn-primary" @click="saveSettings" :disabled="saving" id="save-delivery-btn">
          <span v-if="saving" class="spinner"></span>
          <span v-else>Guardar Entrega</span>
        </button>
      </div>

      <!-- Opening Hours -->
      <div class="settings-section glass-card">
        <div class="section-icon">🕐</div>
        <h3>Horarios de Atención</h3>
        <div class="hours-list">
          <div v-for="day in days" :key="day.key" class="hour-row">
            <span class="day-name">{{ day.label }}</span>
            <input v-model="hours[day.key].open" type="time" class="input input-sm" />
            <span>–</span>
            <input v-model="hours[day.key].close" type="time" class="input input-sm" />
            <button class="toggle-btn small" :class="{ on: hours[day.key].enabled }" @click="hours[day.key].enabled = !hours[day.key].enabled" :id="`toggle-${day.key}`">
              <span class="toggle-knob"></span>
            </button>
          </div>
        </div>
        <button class="btn btn-primary" @click="saveHours" :disabled="saving" id="save-hours-btn">
          <span v-if="saving" class="spinner"></span>
          <span v-else>Save Hours</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'vue-toastification'

const toast = useToast()
const saving = ref(false)

const settings = ref({
  name: 'FlavorHaven', description: '', email: 'hello@flavorhaven.com',
  telephone: '+1 (555) 123-4567', address: '123 Gourmet Ave',
  city: 'Flavor City', postcode: '10001', country: 'United States',
  delivery_min: 10, delivery_charge: 3.99, free_delivery_above: 30, open: true,
})

const days = [
  { key: 'mon', label: 'Lunes' }, { key: 'tue', label: 'Martes' },
  { key: 'wed', label: 'Miércoles' }, { key: 'thu', label: 'Jueves' },
  { key: 'fri', label: 'Viernes' }, { key: 'sat', label: 'Sábado' }, { key: 'sun', label: 'Domingo' },
]

const hours = ref(Object.fromEntries(days.map((d) => [d.key, { open: '11:00', close: '22:00', enabled: d.key !== 'sun' }])))

async function saveSettings() {
  saving.value = true
  // In a real integration, call locationsApi.update(1, settings.value) or similar
  await new Promise((r) => setTimeout(r, 600))
  saving.value = false
  toast.success('¡Configuración guardada!')
}

async function saveHours() {
  saving.value = true
  await new Promise((r) => setTimeout(r, 600))
  saving.value = false
  toast.success('¡Horarios guardados!')
}
</script>

<style scoped>
.admin-settings { display: flex; flex-direction: column; gap: var(--space-6); }
.admin-settings h2 { font-size: 1.4rem; }
.settings-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-5); }
.settings-section { padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-4); }
.section-icon { font-size: 1.8rem; }
.settings-section h3 { font-size: 1rem; font-weight: 600; font-family: var(--font-body); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
.toggle-setting { display: flex; align-items: center; justify-content: space-between; font-size: 0.9rem; color: var(--color-text-2); }
.toggle-btn { width: 48px; height: 26px; border-radius: var(--radius-full); background: var(--color-surface-2); border: 2px solid var(--color-border); cursor: pointer; position: relative; transition: all var(--transition-fast); }
.toggle-btn.on { background: var(--color-accent); border-color: var(--color-accent); }
.toggle-btn.small { width: 38px; height: 22px; flex-shrink: 0; }
.toggle-knob { position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 50%; background: white; transition: transform var(--transition-fast); }
.toggle-btn.on .toggle-knob { transform: translateX(22px); }
.toggle-btn.small .toggle-knob { width: 14px; height: 14px; }
.toggle-btn.small.on .toggle-knob { transform: translateX(16px); }
.hours-list { display: flex; flex-direction: column; gap: var(--space-3); }
.hour-row { display: flex; align-items: center; gap: var(--space-3); }
.day-name { font-size: 0.8rem; color: var(--color-text-2); min-width: 80px; }
.input-sm { max-width: 100px; padding: var(--space-2) var(--space-3) !important; }
@media (max-width: 1024px) { .settings-grid { grid-template-columns: 1fr; } }
@media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }
</style>
