<template>
  <div class="admin-orders">
    <!-- Filters -->
    <div class="filters-bar glass-card">
      <input v-model="search" class="input" placeholder="Buscar pedidos..." id="orders-search" style="max-width: 280px;" />
      <select v-model="statusFilter" class="input" style="max-width: 160px;" id="status-filter">
        <option value="">Todos los Estados</option>
        <option v-for="s in STATUS_OPTIONS" :key="s.value" :value="s.value">{{ s.label }}</option>
      </select>
      <span class="filter-count">{{ filtered.length }} pedidos</span>
    </div>

    <!-- Table -->
    <div class="glass-card table-card">
      <div v-if="orders.loading" class="loading-rows">
        <div v-for="n in 8" :key="n" class="skeleton" style="height:52px; border-radius:var(--radius-md);"></div>
      </div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>Pedido #</th>
            <th>Cliente</th>
            <th>Tipo</th>
            <th>Artículos</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filtered" :key="order.id">
            <td class="font-bold">#{{ order.id }}</td>
            <td>{{ order.customer_name ?? 'Invitado' }}</td>
            <td><span class="type-tag">📋 {{ order.status }}</span></td>
            <td class="text-primary font-bold">${{ Number(order.total).toFixed(2) }}</td>
            <td>
              <select
                :value="order.status"
                @change="updateStatus(order.id, ($event.target as HTMLSelectElement).value)"
                class="status-select"
                :style="{ color: getStatusColor(order.status) }"
                :id="`status-${order.id}`"
              >
                <option v-for="s in STATUS_OPTIONS" :key="s.value" :value="s.value">{{ s.label }}</option>
              </select>
            </td>
            <td class="text-sm text-muted">{{ formatDate(order.created_at) }}</td>
            <td>
              <RouterLink :to="`/admin/orders/${order.id}`" class="btn btn-ghost btn-sm">Detalle</RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useOrdersStore } from '@/stores/orders'
import { useToast } from 'vue-toastification'

const STATUS_OPTIONS = [
  { value: 'pending',    label: '⏳ Pendiente' },
  { value: 'processing', label: '🔄 Procesando' },
  { value: 'preparing',  label: '👨‍🍳 Preparando' },
  { value: 'on-the-way', label: '🚚 En Camino' },
  { value: 'delivered',  label: '✅ Entregado' },
  { value: 'cancelled',  label: '❌ Cancelado' },
  { value: 'completed',  label: '🎉 Completado' },
]

function getStatusColor(status: string) {
  const colors: Record<string, string> = { pending: '#fbbf24', processing: '#3b82f6', preparing: '#8b5cf6', 'on-the-way': '#f59e0b', delivered: '#10b981', cancelled: '#ef4444', completed: '#10b981' }
  return colors[status] ?? '#a3a3a3'
}

const orders = useOrdersStore()
const toast = useToast()
const search = ref('')
const statusFilter = ref('')

const filtered = computed(() => {
  return orders.orders.filter((o: any) => {
    const q = search.value.toLowerCase()
    const matchSearch = !q || String(o.id).includes(q) || (o.customer_name ?? '').toLowerCase().includes(q)
    const matchStatus = !statusFilter.value || o.status === statusFilter.value
    return matchSearch && matchStatus
  })
})

async function updateStatus(id: number, status: string) {
  try { await orders.updateStatus(id, status as any); toast.success('Estado actualizado') }
  catch { toast.error('Error al actualizar el estado') }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })
}

onMounted(() => orders.fetchOrders({ page_limit: 200 }))
</script>

<style scoped>
.admin-orders { display: flex; flex-direction: column; gap: var(--space-5); }
.filters-bar { padding: var(--space-4) var(--space-5); display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap; }
.filter-count { margin-left: auto; font-size: 0.85rem; color: var(--color-text-3); }
.table-card { padding: var(--space-5); }
.loading-rows { display: flex; flex-direction: column; gap: var(--space-3); }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-3); padding: var(--space-2) var(--space-3); border-bottom: 1px solid var(--color-border); font-weight: 600; }
.data-table td { padding: var(--space-3) var(--space-3); font-size: 0.875rem; color: var(--color-text-2); border-bottom: 1px solid rgba(255,255,255,0.04); }
.data-table tr:hover td { background: rgba(255,255,255,0.02); }
.type-tag { font-size: 0.78rem; background: var(--color-surface-2); padding: 3px 8px; border-radius: var(--radius-full); }
.status-select {
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius-md); padding: var(--space-1) var(--space-2);
  font-size: 0.8rem; font-weight: 600; cursor: pointer;
}
</style>
