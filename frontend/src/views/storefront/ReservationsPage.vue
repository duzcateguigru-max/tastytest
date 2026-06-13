<template>
  <div class="reservations-page">
    <div class="container">
      <div class="section-header">
        <span class="eyebrow">Reserve Your Spot</span>
        <h1>Book a <span class="text-gradient">Table</span></h1>
        <p>Reserve your table for a special evening. We accommodate groups of all sizes.</p>
      </div>

      <div class="res-layout">
        <!-- Form -->
        <div class="res-form glass-card">
          <h3>Reservation Details</h3>
          <div class="form-grid">
            <div class="input-group">
              <label class="input-label">First Name</label>
              <input v-model="form.first_name" class="input" placeholder="John" id="res-first-name" />
            </div>
            <div class="input-group">
              <label class="input-label">Last Name</label>
              <input v-model="form.last_name" class="input" placeholder="Doe" id="res-last-name" />
            </div>
          </div>
          <div class="form-grid">
            <div class="input-group">
              <label class="input-label">Date</label>
              <input v-model="form.reserve_date" class="input" type="date" :min="today" id="res-date" />
            </div>
            <div class="input-group">
              <label class="input-label">Time</label>
              <select v-model="form.reserve_time" class="input" id="res-time">
                <option v-for="t in timeSlots" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
          </div>
          <div class="form-grid">
            <div class="input-group">
              <label class="input-label">Guests</label>
              <select v-model="form.guest_num" class="input" id="res-guests">
                <option v-for="n in 10" :key="n" :value="n">{{ n }} {{ n === 1 ? 'Guest' : 'Guests' }}</option>
              </select>
            </div>
            <div class="input-group">
              <label class="input-label">Phone</label>
              <input v-model="form.telephone" class="input" type="tel" placeholder="+1 (555) 000-0000" id="res-phone" />
            </div>
          </div>
          <div class="input-group">
            <label class="input-label">Special Requests</label>
            <textarea v-model="form.comment" class="input" rows="3" placeholder="Dietary needs, occasion, seating preferences..."></textarea>
          </div>
          <button class="btn btn-primary btn-lg w-full" @click="handleSubmit" :disabled="loading" id="book-table-btn">
            <span v-if="loading" class="spinner"></span>
            <span v-else>🎉 Confirm Reservation</span>
          </button>
        </div>

        <!-- Info -->
        <div class="res-info">
          <div class="info-card glass-card">
            <div class="info-icon">🕐</div>
            <h4>Opening Hours</h4>
            <div class="hours-list">
              <div class="hour-row"><span>Mon – Thu</span><span>11:00 – 21:00</span></div>
              <div class="hour-row"><span>Fri – Sat</span><span>11:00 – 23:00</span></div>
              <div class="hour-row"><span>Sunday</span><span>12:00 – 20:00</span></div>
            </div>
          </div>
          <div class="info-card glass-card">
            <div class="info-icon">📍</div>
            <h4>Location</h4>
            <p class="text-sm">123 Gourmet Ave<br/>Flavor City, FC 10001</p>
            <p class="text-sm" style="margin-top: var(--space-2);">📞 +1 (555) 123-4567</p>
          </div>
          <div class="info-card glass-card">
            <div class="info-icon">ℹ️</div>
            <h4>Good to Know</h4>
            <ul class="info-list">
              <li>✓ Reservations held for 15 minutes</li>
              <li>✓ Large groups (10+) please call us</li>
              <li>✓ Private dining room available</li>
              <li>✓ Valet parking available</li>
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
    toast.success('Reservation confirmed! See you soon 🎉')
    form.value = { first_name:'', last_name:'', telephone:'', reserve_date:'', reserve_time:'19:00', guest_num:2, comment:'' }
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? 'Failed to make reservation')
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
