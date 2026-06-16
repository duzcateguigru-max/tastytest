<template>
  <div class="admin-reservations">
    <div class="page-top">
      <h2>Reservaciones</h2>
      <div class="top-filters">
        <input v-model="search" class="input" placeholder="Buscar..." style="max-width:240px;" id="res-search" />
        <select v-model="statusFilter" class="input" style="max-width:180px;" id="res-status-filter">
          <option value="">Todas las Reservas</option>
          <option value="2">Confirmada</option>
          <option value="3">Cancelada</option>
          <option value="1">Pendiente</option>
        </select>
      </div>
    </div>

    <div class="glass-card table-card">
      <div v-if="loading" class="loading-rows">
        <div v-for="n in 6" :key="n" class="skeleton" style="height:52px;border-radius:var(--radius-md);"></div>
      </div>
      <table v-else class="data-table">
        <thead>
          <tr><th>#</th><th>Nombre</th><th>Fecha y Hora</th><th>Comensales</th><th>Teléfono</th><th>Estado</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          <tr v-for="r in filtered" :key="r.id">
            <td class="text-muted">{{ r.id }}</td>
            <td class="font-bold">{{ r.first_name }} {{ r.last_name }}</td>
            <td class="text-sm">
              <div>{{ formatDate(r.reserve_date) }}</div>
              <div class="text-muted">{{ r.reserve_time }}</div>
            </td>
            <td><span class="badge badge-neutral">{{ r.guest_num }} comensales</span></td>
            <td class="text-muted text-sm">{{ r.telephone ?? '—' }}</td>
            <td>
              <span :class="`badge badge-${getResBadge(r.status_id)}`">{{ getResStatus(r.status_id) }}</span>
            </td>
            <td>
              <div class="row-actions">
                <button class="btn btn-sm" style="color:var(--color-accent)" @click="updateResStatus(r.id, 2)" v-if="r.status_id !== 2" :id="`confirm-${r.id}`">Confirmar</button>
                <button class="btn btn-sm" style="color:var(--color-secondary)" @click="updateResStatus(r.id, 3)" v-if="r.status_id !== 3" :id="`cancel-${r.id}`">Cancelar</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!loading && filtered.length === 0" class="empty-state">
        <div class="empty-icon">📅</div>
        <p>No se encontraron reservaciones</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { reservationsApi } from '@/services/api'
import { useToast } from 'vue-toastification'

const toast = useToast()
const reservations = ref<any[]>([])
const loading = ref(true)
const search = ref('')
const statusFilter = ref('')

const filtered = computed(() => {
  return reservations.value.filter((r) => {
    const q = search.value.toLowerCase()
    const ms = !q || `${r.first_name} ${r.last_name}`.toLowerCase().includes(q)
    const mst = !statusFilter.value || String(r.status_id) === statusFilter.value
    return ms && mst
  })
})

function getResStatus(id: number) { return { 1: 'Pendiente', 2: 'Confirmada', 3: 'Cancelada' }[id] ?? 'Pendiente' }
function getResBadge(id: number) { return { 1: 'warning', 2: 'success', 3: 'danger' }[id] ?? 'warning' }
function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric' }) : '—' }

async function updateResStatus(id: number, status: number) {
  try { await reservationsApi.update(id, { status_id: status }); toast.success('Reserva actualizada'); await fetchReservations() }
  catch { toast.error('Error al actualizar') }
}

async function fetchReservations() {
  try { const res = await reservationsApi.getAll({ page_limit: 200 }); reservations.value = res.data.data ?? res.data }
  catch { reservations.value = [] } finally { loading.value = false }
}

onMounted(async () => {
  await fetchReservations()
})
</script>

<style scoped>
.admin-reservations { display: flex; flex-direction: column; gap: var(--space-5); }
.page-top { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-4); }
.page-top h2 { font-size: 1.4rem; }
.top-filters { display: flex; gap: var(--space-3); flex-wrap: wrap; }
.table-card { padding: var(--space-5); }
.loading-rows { display: flex; flex-direction: column; gap: var(--space-3); }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-3); padding: var(--space-2) var(--space-3); border-bottom: 1px solid var(--color-border); font-weight: 600; }
.data-table td { padding: var(--space-3) var(--space-3); font-size: 0.875rem; color: var(--color-text-2); border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; }
.data-table tr:hover td { background: rgba(255,255,255,0.02); }
.row-actions { display: flex; gap: var(--space-2); }
.empty-state { text-align: center; padding: var(--space-12) 0; }
.empty-icon { font-size: 3rem; margin-bottom: var(--space-3); }
</style>
