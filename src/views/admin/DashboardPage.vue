<template>
  <div class="dashboard">
    <!-- KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card glass-card" v-for="kpi in kpiCards" :key="kpi.label">
        <div class="kpi-icon" :style="{ background: kpi.color + '20', color: kpi.color }">{{ kpi.icon }}</div>
        <div class="kpi-info">
          <span class="kpi-label">{{ kpi.label }}</span>
          <span class="kpi-value">{{ kpi.value }}</span>
        </div>
        <div class="kpi-trend" :class="kpi.trendUp ? 'up' : 'neutral'">
          {{ kpi.trendUp ? '↑' : '→' }} {{ kpi.trend }}
        </div>
      </div>
    </div>

    <!-- Charts row -->
    <div class="charts-row">
      <div class="chart-card glass-card">
        <h3>Ingresos (7 Últimos Días)</h3>
        <div class="chart-container" v-if="adminStore.stats">
          <Bar :data="revenueChartData" :options="chartOptions" />
        </div>
        <div class="skeleton chart-skeleton" v-else></div>
      </div>
      <div class="chart-card glass-card">
        <h3>Pedidos por Estado</h3>
        <div class="chart-container doughnut" v-if="adminStore.stats">
          <Doughnut :data="statusChartData" :options="doughnutOptions" />
        </div>
        <div class="skeleton chart-skeleton" v-else></div>
      </div>
    </div>

    <!-- Recent orders -->
    <div class="recent-orders glass-card">
      <div class="section-top">
        <h3>Pedidos Recientes</h3>
        <RouterLink to="/admin/orders" class="btn btn-ghost btn-sm">Ver Todos →</RouterLink>
      </div>
      <div v-if="orders.loading" class="orders-skeleton">
        <div v-for="n in 5" :key="n" class="skeleton" style="height: 52px; border-radius: var(--radius-md);"></div>
      </div>
      <table v-else class="orders-table">
        <thead>
          <tr>
            <th>Pedido #</th>
            <th>Cliente</th>
            <th>Tipo</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in recentOrders" :key="order.id">
            <td class="order-num">#{{ order.id }}</td>
            <td>{{ order.customer_name ?? 'Invitado' }}</td>
            <td><span class="type-tag">{{ order.order_type }}</span></td>
            <td class="order-total">${{ Number(order.total).toFixed(2) }}</td>
            <td>
              <span class="badge" :style="{ background: getStatusColor(order.status), color: '#fff' }">
                {{ order.status ?? 'pending' }}
              </span>
            </td>
            <td class="date-cell">{{ formatDate(order.created_at) }}</td>
            <td>
              <RouterLink :to="`/admin/orders/${order.id}`" class="btn btn-ghost btn-sm">Ver</RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend, ArcElement,
} from 'chart.js'
import { useAdminStore } from '@/stores/admin'
import { useOrdersStore } from '@/stores/orders'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

const adminStore = useAdminStore()
const orders = useOrdersStore()

const recentOrders = computed(() => orders.orders.slice(0, 10))

const kpiCards = computed(() => {
  const s = adminStore.stats
  return [
    { icon: '📦', label: 'Total Pedidos', value: s?.totalOrders ?? '–', color: '#f59e0b', trend: 'Este mes', trendUp: true },
    { icon: '💰', label: 'Ingresos', value: s ? `$${s.totalRevenue.toFixed(2)}` : '–', color: '#10b981', trend: 'Este mes', trendUp: true },
    { icon: '👥', label: 'Clientes', value: s?.totalCustomers ?? '–', color: '#3b82f6', trend: 'Total registrados', trendUp: true },
    { icon: '⏳', label: 'Pedidos Pendientes', value: s?.pendingOrders ?? '–', color: '#ef4444', trend: 'Requieren atención', trendUp: false },
  ]
})

const revenueChartData = computed(() => ({
  labels: adminStore.stats?.revenueByDay.map((d) => d.date.slice(5)) ?? [],
  datasets: [{
    label: 'Revenue ($)',
    data: adminStore.stats?.revenueByDay.map((d) => d.revenue) ?? [],
    backgroundColor: 'rgba(245,158,11,0.6)',
    borderColor: '#f59e0b',
    borderWidth: 2,
    borderRadius: 6,
  }],
}))

const statusChartData = computed(() => ({
  labels: adminStore.stats?.ordersByStatus.map((s) => s.status) ?? [],
  datasets: [{
    data: adminStore.stats?.ordersByStatus.map((s) => s.count) ?? [],
    backgroundColor: ['#f59e0b','#10b981','#3b82f6','#ef4444','#8b5cf6','#fbbf24'],
    borderWidth: 0,
  }],
}))

const chartOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c: any) => ` $${c.raw.toFixed(2)}` } } },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#a3a3a3' } },
    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#a3a3a3', callback: (v: any) => `$${v}` } },
  },
}
const doughnutOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' as const, labels: { color: '#a3a3a3', padding: 16, font: { size: 12 } } } } }

function getStatusColor(status: string) {
  const colors: Record<string, string> = { pending: '#fbbf24', processing: '#3b82f6', preparing: '#8b5cf6', 'on-the-way': '#f59e0b', delivered: '#10b981', cancelled: '#ef4444', completed: '#10b981' }
  return colors[status] ?? '#6b7280'
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })
}

onMounted(async () => {
  await Promise.all([adminStore.fetchStats(), orders.fetchOrders({ page_limit: 10, sort_by: 'created_at', sort_direction: 'desc' })])
})
</script>

<style scoped>
.dashboard { display: flex; flex-direction: column; gap: var(--space-6); }

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-5);
}
.kpi-card { padding: var(--space-5); display: flex; align-items: center; gap: var(--space-4); }
.kpi-icon {
  width: 52px; height: 52px; flex-shrink: 0;
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem;
}
.kpi-info { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.kpi-label { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-3); }
.kpi-value { font-size: 1.5rem; font-weight: 700; font-family: var(--font-heading); color: var(--color-text); }
.kpi-trend { font-size: 0.72rem; font-weight: 600; padding: 2px 8px; border-radius: var(--radius-full); }
.kpi-trend.up { background: rgba(16,185,129,0.15); color: #10b981; }
.kpi-trend.neutral { background: rgba(255,255,255,0.07); color: var(--color-text-3); }

.charts-row { display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-6); }
.chart-card { padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-4); }
.chart-card h3 { font-size: 1rem; font-family: var(--font-body); font-weight: 600; }
.chart-container { height: 240px; }
.chart-container.doughnut { max-width: 260px; margin-inline: auto; }
.chart-skeleton { height: 240px; border-radius: var(--radius-md); }

.recent-orders { padding: var(--space-6); }
.section-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-5); }
.section-top h3 { font-size: 1rem; font-weight: 600; font-family: var(--font-body); }
.orders-skeleton { display: flex; flex-direction: column; gap: var(--space-3); }

.orders-table { width: 100%; border-collapse: collapse; }
.orders-table th {
  text-align: left; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--color-text-3); padding: var(--space-2) var(--space-3); border-bottom: 1px solid var(--color-border);
  font-weight: 600;
}
.orders-table td { padding: var(--space-3) var(--space-3); font-size: 0.875rem; color: var(--color-text-2); border-bottom: 1px solid rgba(255,255,255,0.04); }
.orders-table tr:hover td { background: rgba(255,255,255,0.02); }
.order-num { font-weight: 700; color: var(--color-text); }
.order-total { font-weight: 600; color: var(--color-primary); }
.type-tag { font-size: 0.72rem; background: var(--color-surface-2); padding: 2px 8px; border-radius: var(--radius-full); }
.date-cell { font-size: 0.78rem; color: var(--color-text-3); }

@media (max-width: 1280px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } .charts-row { grid-template-columns: 1fr; } }
@media (max-width: 640px) { .kpi-grid { grid-template-columns: 1fr 1fr; } .orders-table { display: block; overflow-x: auto; } }
</style>
