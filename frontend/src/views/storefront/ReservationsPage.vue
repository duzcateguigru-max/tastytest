<template>
  <div class="reservations-page">
    <div class="container">
      <div class="section-header">
        <span class="eyebrow">Reserva Tu Lugar</span>
        <h1>Reserva Una <span class="text-gradient">Mesa</span></h1>
        <p>Reserva tu mesa para una noche especial. Atendemos grupos de todos los tamaños.</p>
      </div>

      <div class="res-layout">
        <!-- Form -->
        <div class="res-form glass-card">
          <h3>Detalles de la Reserva</h3>
          <div class="form-grid">
            <div class="input-group">
              <label class="input-label">Nombre</label>
              <input v-model="form.first_name" class="input" placeholder="Juan" id="res-first-name" />
            </div>
            <div class="input-group">
              <label class="input-label">Apellido</label>
              <input v-model="form.last_name" class="input" placeholder="Pérez" id="res-last-name" />
            </div>
          </div>
          <div class="form-grid">
            <div class="input-group">
              <label class="input-label">Fecha</label>
              <input v-model="form.reserve_date" class="input" type="date" :min="today" id="res-date" />
            </div>
            <div class="input-group">
              <label class="input-label">Hora</label>
              <select v-model="form.reserve_time" class="input" id="res-time">
                <option v-for="t in timeSlots" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
          </div>
          <div class="form-grid">
            <div class="input-group">
              <label class="input-label">Comensales</label>
              <select v-model="form.guest_num" class="input" id="res-guests">
                <option v-for="n in 10" :key="n" :value="n">{{ n }} {{ n === 1 ? 'Comensal' : 'Comensales' }}</option>
              </select>
            </div>
            <div class="input-group">
              <label class="input-label">Teléfono</label>
              <input v-model="form.telephone" class="input" type="tel" placeholder="+1 (555) 000-0000" id="res-phone" />
            </div>
          </div>
          <div class="input-group">
            <label class="input-label">Solicitudes Especiales</label>
            <textarea v-model="form.comment" class="input" rows="3" placeholder="Dietas, ocasión, preferencias de mesa..."></textarea>
          </div>
          <button class="btn btn-primary btn-lg w-full" @click="handleSubmit" :disabled="loading" id="book-table-btn">
            <span v-if="loading" class="spinner"></span>
            <span v-else>🎉 Confirmar Reserva</span>
          </button>
        </div>

        <!-- Info -->
        <div class="res-info">
          <div class="info-card glass-card">
            <div class="info-icon">🕐</div>
            <h4>Horario de Atención</h4>
            <div class="hours-list">
              <div class="hour-row"><span>Lun – Jue</span><span>11:00 – 21:00</span></div>
              <div class="hour-row"><span>Vie – Sáb</span><span>11:00 – 23:00</span></div>
              <div class="hour-row"><span>Domingo</span><span>12:00 – 20:00</span></div>
            </div>
          </div>
          <div class="info-card glass-card">
            <div class="info-icon">📍</div>
            <h4>Ubicación</h4>
            <p class="text-sm">123 Av. Gourmet<br/>Ciudad Sabor, CS 10001</p>
            <p class="text-sm" style="margin-top: var(--space-2);">📞 +1 (555) 123-4567</p>
          </div>
          <div class="info-card glass-card">
            <div class="info-icon">ℹ️</div>
            <h4>Información Importante</h4>
            <ul class="info-list">
              <li>✓ Reservas guardadas 15 minutos</li>
              <li>✓ Grupos de +10 personas, llama por favor</li>
              <li>✓ Salón privado disponible</li>
              <li>✓ Valet parking disponible</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { reservationsApi } from '@/services/api'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'

const toast = useToast()
const router = useRouter()
const loading = ref(false)
const today = new Date().toISOString().split('T')[0]

const form = ref({
  first_name: '', last_name: '', telephone: '',
  reserve_date: '', reserve_time: '19:00', guest_num: 2, comment: '',
})

const timeSlots = Array.from({ length: 22 }, (_, i) => {
  const h = Math.floor(i / 2) + 11
  const m = i % 2 === 0 ? '00' : '30'
  return `${h.toString().padStart(2,'0')}:${m}`
}).filter((_, i) => i < 22)

async function handleSubmit() {
  loading.value = true
  try {
    await reservationsApi.create({ ...form.value })
    toast.success('¡Reserva confirmada! Hasta pronto 🎉')
    form.value = { first_name:'', last_name:'', telephone:'', reserve_date:'', reserve_time:'19:00', guest_num:2, comment:'' }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? 'Error al hacer la reserva')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.reservations-page { padding: var(--space-12) 0 var(--space-16); }
.section-header { margin-bottom: var(--space-10); }
.res-layout {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: var(--space-8);
  align-items: start;
}
.res-form { padding: var(--space-8); display: flex; flex-direction: column; gap: var(--space-5); }
.res-form h3 { font-family: var(--font-heading); margin-bottom: var(--space-2); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }

.res-info { display: flex; flex-direction: column; gap: var(--space-4); }
.info-card { padding: var(--space-5); display: flex; flex-direction: column; gap: var(--space-3); }
.info-icon { font-size: 1.8rem; }
.info-card h4 { font-size: 1rem; font-family: var(--font-body); }
.hours-list { display: flex; flex-direction: column; gap: var(--space-2); }
.hour-row {
  display: flex; justify-content: space-between;
  font-size: 0.875rem; color: var(--color-text-2);
}
.info-list { display: flex; flex-direction: column; gap: var(--space-2); }
.info-list li { font-size: 0.82rem; color: var(--color-text-2); }

@media (max-width: 1024px) { .res-layout { grid-template-columns: 1fr; } }
@media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }
</style>
