<template>
  <div class="tracking-page">
    <div class="container">
      <RouterLink to="/orders" class="back-link">
        <ChevronLeft :size="18" /> Mis Pedidos
      </RouterLink>

      <div v-if="orders.loading && !orders.currentOrder" class="loading-state">
        <div class="spinner" style="width:48px; height:48px; border-width: 5px;"></div>
        <p>Cargando tu pedido...</p>
      </div>

      <div v-else-if="orders.currentOrder" class="tracking-layout">
        <!-- Header -->
        <div class="tracking-header glass-card">
          <div class="order-id-block">
            <span class="order-label">Order</span>
            <span class="order-num">#{{ orders.currentOrder.id }}</span>
          </div>
          <div class="order-type-badge">
            <span>{{ orders.currentOrder.order_type === 'delivery' ? '🚚 Entrega' : '🏪 Recogida' }}</span>
          </div>
          <div :class="`badge badge-${getStatusBadge(orders.currentOrder.status_id)}`">
            {{ getStatusLabel(orders.currentOrder.status_id) }}
          </div>
          <div class="order-total-block">
            <span class="order-label">Total</span>
            <span class="order-total-val">${{ Number(orders.currentOrder.order_total).toFixed(2) }}</span>
          </div>
        </div>

        <!-- Status Timeline -->
        <div class="timeline-card glass-card">
          <h3>Seguimiento del Pedido</h3>
          <div class="timeline">
            <div
              v-for="(step, i) in timelineSteps"
              :key="i"
              class="timeline-step"
              :class="{
                done: orders.currentOrder.status_id >= step.statusId,
                current: isCurrentStep(step.statusId, orders.currentOrder.status_id),
              }"
            >
              <div class="tl-icon-col">
                <div class="tl-dot">{{ orders.currentOrder.status_id >= step.statusId ? '✓' : step.icon }}</div>
                <div class="tl-line" v-if="i < timelineSteps.length - 1"></div>
              </div>
              <div class="tl-content">
                <span class="tl-title">{{ step.label }}</span>
                <span class="tl-desc">{{ step.desc }}</span>
                <span v-if="isCurrentStep(step.statusId, orders.currentOrder.status_id)" class="tl-current-badge">En Proceso</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Order items -->
        <div class="order-items-card glass-card">
          <h3>Artículos Pedidos</h3>
          <div class="order-items-list">
            <div v-for="item in orders.currentOrder.order_menus" :key="item.id" class="oi-row">
              <span class="oi-name">{{ item.name }} <span class="oi-qty">×{{ item.quantity }}</span></span>
              <span class="oi-price">${{ (Number(item.price) * item.quantity).toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">📦</div>
        <h3>Order not found</h3>
        <RouterLink to="/orders" class="btn btn-primary">Ver Mis Pedidos</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ChevronLeft } from '@lucide/vue'
import { useOrdersStore, ORDER_STATUSES } from '@/stores/orders'

const route = useRoute()
const orders = useOrdersStore()

const timelineSteps = [
  { statusId: 1, icon: '📋', label: 'Pedido Realizado',    desc: 'Recibimos tu pedido' },
  { statusId: 2, icon: '✅', label: 'Confirmado',        desc: 'El restaurante confirmó tu pedido' },
  { statusId: 3, icon: '👨‍🍳', label: 'Preparando',       desc: 'Estamos preparando tu comida' },
  { statusId: 4, icon: '🚚', label: 'En Camino',          desc: 'El repartidor va hacia ti' },
  { statusId: 5, icon: '🎉', label: 'Entregado',          desc: '¡Buen provecho!' },
]

function getStatusLabel(id: number) {
  return ORDER_STATUSES[id]?.label ?? 'Processing'
}
function getStatusBadge(id: number) {
  if (id >= 5) return 'success'
  if (id === 6) return 'danger'
  return 'warning'
}
function isCurrentStep(stepId: number, currentId: number) {
  return currentId === stepId || (stepId === 4 && currentId > 3 && currentId < 5)
}

onMounted(async () => {
  const id = Number(route.params.id)
  await orders.fetchOrder(id)
  if (orders.currentOrder && orders.currentOrder.status_id < 5) {
    orders.startPolling(id)
  }
})
onUnmounted(() => orders.stopPolling())
</script>

<style scoped>
.tracking-page { padding: var(--space-8) 0 var(--space-16); }
.back-link {
  display: inline-flex; align-items: center; gap: var(--space-2);
  color: var(--color-text-2); font-size: 0.875rem; margin-bottom: var(--space-6);
  transition: color var(--transition-fast);
}
.back-link:hover { color: var(--color-primary); }

.loading-state { display: flex; flex-direction: column; align-items: center; gap: var(--space-4); padding: var(--space-20) 0; }

.tracking-layout { display: flex; flex-direction: column; gap: var(--space-6); max-width: 720px; margin-inline: auto; }

.tracking-header {
  display: flex; align-items: center; gap: var(--space-6);
  padding: var(--space-6); flex-wrap: wrap;
}
.order-id-block, .order-total-block { display: flex; flex-direction: column; gap: 2px; }
.order-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-text-3); }
.order-num { font-size: 1.5rem; font-weight: 700; font-family: var(--font-heading); }
.order-total-val { font-size: 1.3rem; font-weight: 700; color: var(--color-primary); }
.order-type-badge { background: var(--color-surface-2); padding: var(--space-2) var(--space-4); border-radius: var(--radius-full); font-size: 0.875rem; }

.timeline-card { padding: var(--space-6); }
.timeline-card h3 { margin-bottom: var(--space-6); }
.timeline { display: flex; flex-direction: column; gap: 0; }
.timeline-step { display: flex; gap: var(--space-4); }

.tl-icon-col { display: flex; flex-direction: column; align-items: center; }
.tl-dot {
  width: 40px; height: 40px; flex-shrink: 0;
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem;
  transition: all var(--transition-base);
}
.timeline-step.done .tl-dot { background: var(--color-accent); border-color: var(--color-accent); color: white; }
.timeline-step.current .tl-dot {
  background: var(--color-primary-dim); border-color: var(--color-primary); color: var(--color-primary);
  animation: pulse-glow 2s ease-in-out infinite;
}
.tl-line {
  width: 2px; flex: 1; min-height: 24px;
  background: var(--color-border); margin-block: 4px;
  transition: background var(--transition-slow);
}
.timeline-step.done .tl-line { background: var(--color-accent); }

.tl-content {
  padding-bottom: var(--space-6);
  display: flex; flex-direction: column; gap: 4px; flex: 1;
  padding-top: 8px;
}
.tl-title { font-weight: 600; font-size: 0.95rem; color: var(--color-text); }
.tl-desc { font-size: 0.82rem; color: var(--color-text-3); }
.tl-current-badge {
  font-size: 0.7rem; font-weight: 700;
  background: var(--color-primary); color: var(--color-text-invert);
  padding: 2px 8px; border-radius: var(--radius-full);
  display: inline-block; width: fit-content;
}

.order-items-card { padding: var(--space-6); }
.order-items-card h3 { margin-bottom: var(--space-5); }
.order-items-list { display: flex; flex-direction: column; gap: var(--space-3); }
.oi-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: var(--space-3) 0; border-bottom: 1px solid var(--color-border);
  font-size: 0.9rem;
}
.oi-qty { color: var(--color-text-3); }
.oi-price { font-weight: 600; color: var(--color-primary); }

.empty-state { text-align: center; padding: var(--space-20) 0; }
.empty-icon { font-size: 4rem; margin-bottom: var(--space-4); }
</style>
