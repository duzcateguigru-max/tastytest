<template>
  <div class="orders-page">
    <div class="container">
      <h1>Mis <span class="text-gradient">Pedidos</span></h1>

      <div v-if="orders.loading" class="orders-list">
        <div v-for="n in 4" :key="n" class="order-skeleton glass-card">
          <div class="skeleton" style="height:20px; width:30%;"></div>
          <div class="skeleton" style="height:16px; width:50%;"></div>
          <div class="skeleton" style="height:36px; width:120px;"></div>
        </div>
      </div>

      <div v-else-if="orders.orders.length === 0" class="empty-state">
        <div class="empty-icon">📦</div>
        <h2>Aún no tienes pedidos</h2>
        <p>Empieza explorando nuestro delicioso menú.</p>
        <RouterLink to="/menu" class="btn btn-primary btn-lg">Ver Menú</RouterLink>
      </div>

      <div v-else class="orders-list">
        <div v-for="order in orders.orders" :key="order.id" class="order-card glass-card">
          <div class="order-card-left">
            <div class="order-id">#{{ order.id }}</div>
            <div class="order-date">{{ formatDate(order.created_at) }}</div>
            <div class="order-type-label">{{ order.order_type === 'delivery' ? '🚚 Delivery' : '🏪 Pickup' }}</div>
          </div>
          <div class="order-card-center">
            <div :class="`badge badge-${getStatusBadge(order.status_id)}`">
              {{ getStatusLabel(order.status_id) }}
            </div>
          </div>
          <div class="order-card-right">
            <span class="order-price">${{ Number(order.order_total).toFixed(2) }}</span>
            <RouterLink :to="`/orders/${order.id}`" class="btn btn-outline btn-sm" :id="`track-${order.id}`">
              Rastrear Pedido
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useOrdersStore, ORDER_STATUSES } from '@/stores/orders'

const orders = useOrdersStore()

function getStatusLabel(id: number) { return ORDER_STATUSES[id]?.label ?? 'Processing' }
function getStatusBadge(id: number) {
  if (id >= 5) return 'success'; if (id === 6) return 'danger'; return 'warning'
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })
}

onMounted(() => orders.fetchOrders())
</script>

<style scoped>
.orders-page { padding: var(--space-12) 0 var(--space-16); }
.orders-page h1 { margin-bottom: var(--space-8); }
.orders-list { display: flex; flex-direction: column; gap: var(--space-4); }
.order-skeleton { padding: var(--space-5); display: flex; flex-direction: column; gap: var(--space-3); }
.order-card {
  padding: var(--space-5) var(--space-6);
  display: flex; align-items: center; gap: var(--space-6); flex-wrap: wrap;
}
.order-card-left { display: flex; flex-direction: column; gap: var(--space-1); flex: 1; }
.order-id { font-weight: 700; font-size: 1.1rem; color: var(--color-text); }
.order-date { font-size: 0.8rem; color: var(--color-text-3); }
.order-type-label { font-size: 0.85rem; color: var(--color-text-2); }
.order-card-center { flex: 1; }
.order-card-right { display: flex; align-items: center; gap: var(--space-4); }
.order-price { font-size: 1.1rem; font-weight: 700; color: var(--color-primary); }
.empty-state { text-align: center; padding: var(--space-20) 0; display: flex; flex-direction: column; align-items: center; gap: var(--space-5); }
.empty-icon { font-size: 4rem; }
</style>
