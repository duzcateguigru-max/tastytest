<template>
  <div class="order-detail-page">
    <RouterLink to="/admin/orders" class="back-link">
      <ChevronLeft :size="18" /> Todos los pedidos
    </RouterLink>

    <div v-if="orders.loading" class="loading-state">
      <div class="spinner" style="width:48px;height:48px;border-width:5px;"></div>
    </div>

    <div v-else-if="orders.currentOrder" class="detail-layout">
      <!-- Header -->
      <div class="detail-header glass-card">
        <div>
          <h2>Pedido #{{ orders.currentOrder.id }}</h2>
          <span class="order-date">{{ formatDate(orders.currentOrder.created_at) }}</span>
        </div>
        <div class="header-actions">
          <span :class="`badge badge-${getStatusBadge(orders.currentOrder.status_id)}`" style="font-size:0.9rem; padding: 0.4em 1em;">
            {{ getStatusLabel(orders.currentOrder.status_id) }}
          </span>
          <select
            :value="orders.currentOrder.status_id"
            @change="changeStatus(Number(($event.target as HTMLSelectElement).value))"
            class="input" style="max-width:180px;"
            id="detail-status-select"
          >
            <option v-for="(s, sid) in ORDER_STATUSES" :key="sid" :value="sid">{{ s.label }}</option>
          </select>
        </div>
      </div>

      <div class="detail-grid">
        <!-- Order items -->
        <div class="glass-card detail-section">
          <h3>Productos del pedido</h3>
          <div class="items-list">
            <div v-for="item in orders.currentOrder.order_menus" :key="item.id" class="detail-item">
              <div class="di-name">{{ item.name }}</div>
              <div class="di-qty">×{{ item.quantity }}</div>
              <div class="di-price">${{ (Number(item.price) * item.quantity).toFixed(2) }}</div>
            </div>
          </div>
          <div class="items-total">
            <span>Total</span>
            <span class="text-primary font-bold">${{ Number(orders.currentOrder.order_total).toFixed(2) }}</span>
          </div>
        </div>

        <!-- Customer & delivery info -->
        <div class="right-col">
          <div class="glass-card detail-section">
            <h3>Cliente</h3>
            <div class="info-row"><span>Nombre</span><span>{{ orders.currentOrder.customer_name ?? 'Invitado' }}</span></div>
            <div class="info-row"><span>Tipo de pedido</span>
              <span class="type-tag">{{ orders.currentOrder.order_type === 'delivery' ? '🚚 Entrega' : '🏪 Recogida' }}</span>
            </div>
            <div class="info-row"><span>Ubicación</span><span>{{ orders.currentOrder.location?.location_name ?? 'Sucursal principal' }}</span></div>
          </div>

          <!-- Status timeline -->
          <div class="glass-card detail-section">
            <h3>Historial de estado</h3>
            <div class="mini-timeline">
              <div
                v-for="(step, i) in timelineSteps"
                :key="i"
                class="mini-step"
                :class="{ done: orders.currentOrder.status_id >= step.id }"
              >
                <div class="mini-dot">{{ orders.currentOrder.status_id >= step.id ? '✓' : '' }}</div>
                <span>{{ step.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">📦</div>
      <h3>Pedido no encontrado</h3>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ChevronLeft } from '@lucide/vue'
import { useOrdersStore, ORDER_STATUSES } from '@/stores/orders'
import { useToast } from 'vue-toastification'

const orders = useOrdersStore()
const route = useRoute()
const toast = useToast()

const timelineSteps = [
  { id: 1, label: 'Pendiente' }, { id: 2, label: 'En proceso' },
  { id: 3, label: 'En preparación' }, { id: 4, label: 'En tránsito' }, { id: 5, label: 'Entregado' },
]

function getStatusLabel(id: number) { return ORDER_STATUSES[id]?.label ?? 'En proceso' }
function getStatusBadge(id: number) {
  if (id >= 5) return 'success'; if (id === 6) return 'danger'; return 'warning'
}
function formatDate(d: string) {
  return new Date(d).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })
}
async function changeStatus(status_id: number) {
  const id = orders.currentOrder?.id
  if (!id) return
  try { await orders.updateStatus(id, status_id); toast.success('Estado actualizado') }
  catch { toast.error('Error al actualizar el estado') }
}

onMounted(() => orders.fetchOrder(Number(route.params.id)))
</script>

<style scoped>
.order-detail-page { display: flex; flex-direction: column; gap: var(--space-5); }
.back-link { display: inline-flex; align-items: center; gap: var(--space-2); color: var(--color-text-2); font-size: 0.875rem; transition: color var(--transition-fast); }
.back-link:hover { color: var(--color-primary); }
.loading-state { display: flex; justify-content: center; padding: var(--space-16); }
.detail-header { padding: var(--space-6); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-4); }
.detail-header h2 { font-size: 1.5rem; }
.order-date { font-size: 0.82rem; color: var(--color-text-3); }
.header-actions { display: flex; align-items: center; gap: var(--space-4); }
.detail-grid { display: grid; grid-template-columns: 1fr 340px; gap: var(--space-5); align-items: start; }
.detail-section { padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-4); }
.detail-section h3 { font-size: 1rem; font-weight: 600; font-family: var(--font-body); border-bottom: 1px solid var(--color-border); padding-bottom: var(--space-3); }
.right-col { display: flex; flex-direction: column; gap: var(--space-5); }
.items-list { display: flex; flex-direction: column; gap: var(--space-3); }
.detail-item { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3) 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 0.9rem; }
.di-name { flex: 1; color: var(--color-text); }
.di-qty { color: var(--color-text-3); min-width: 32px; }
.di-price { font-weight: 600; color: var(--color-text); min-width: 70px; text-align: right; }
.items-total { display: flex; justify-content: space-between; align-items: center; font-size: 1rem; font-weight: 600; padding-top: var(--space-3); }
.info-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem; color: var(--color-text-2); padding: var(--space-2) 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
.info-row span:last-child { color: var(--color-text); font-weight: 500; }
.type-tag { background: var(--color-surface-2); padding: 2px 8px; border-radius: var(--radius-full); font-size: 0.8rem; }
.mini-timeline { display: flex; flex-direction: column; gap: var(--space-3); }
.mini-step { display: flex; align-items: center; gap: var(--space-3); font-size: 0.875rem; color: var(--color-text-3); }
.mini-step.done { color: var(--color-accent); }
.mini-dot { width: 22px; height: 22px; border-radius: 50%; background: var(--color-surface); border: 2px solid var(--color-border); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; flex-shrink: 0; }
.mini-step.done .mini-dot { background: var(--color-accent); border-color: var(--color-accent); color: white; }
.empty-state { text-align: center; padding: var(--space-16); }
.empty-icon { font-size: 4rem; }
@media (max-width: 1024px) { .detail-grid { grid-template-columns: 1fr; } }
</style>
