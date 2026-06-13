<template>
  <div class="admin-customers">
    <div class="page-top">
      <h2>Clientes</h2>
      <input v-model="search" class="input" placeholder="Buscar clientes..." style="max-width:280px;" id="cust-search" />
    </div>

    <div class="glass-card table-card">
      <div v-if="loading" class="loading-rows">
        <div v-for="n in 8" :key="n" class="skeleton" style="height:52px;border-radius:var(--radius-md);"></div>
      </div>
      <table v-else class="data-table">
        <thead>
          <tr><th>#</th><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Pedidos</th><th>Registro</th></tr>
        </thead>
        <tbody>
          <tr v-for="c in filtered" :key="c.id">
            <td class="text-muted">{{ c.id }}</td>
            <td>
              <div class="customer-cell">
                <div class="cust-avatar">{{ c.first_name?.charAt(0) ?? '?' }}</div>
                <span class="font-bold">{{ c.first_name }} {{ c.last_name }}</span>
              </div>
            </td>
            <td class="text-muted text-sm">{{ c.email }}</td>
            <td class="text-muted text-sm">{{ c.telephone ?? '—' }}</td>
            <td><span class="badge badge-neutral">{{ c.orders_count ?? 0 }}</span></td>
            <td class="text-muted text-sm">{{ formatDate(c.created_at) }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="!loading && filtered.length === 0" class="empty-state">
        <div class="empty-icon">👥</div>
        <p>No customers found</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { customersApi } from '@/services/api'

const customers = ref<any[]>([])
const loading = ref(true)
const search = ref('')

const filtered = computed(() => {
  if (!search.value) return customers.value
  const q = search.value.toLowerCase()
  return customers.value.filter((c) =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
    c.email?.toLowerCase().includes(q),
  )
})

function formatDate(d: string) {
  return d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'
}

onMounted(async () => {
  try { const res = await customersApi.getAll({ page_limit: 500 }); customers.value = res.data.data ?? res.data }
  catch { customers.value = [] } finally { loading.value = false }
})
</script>

<style scoped>
.admin-customers { display: flex; flex-direction: column; gap: var(--space-5); }
.page-top { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-4); }
.page-top h2 { font-size: 1.4rem; }
.table-card { padding: var(--space-5); }
.loading-rows { display: flex; flex-direction: column; gap: var(--space-3); }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-3); padding: var(--space-2) var(--space-3); border-bottom: 1px solid var(--color-border); font-weight: 600; }
.data-table td { padding: var(--space-3) var(--space-3); font-size: 0.875rem; color: var(--color-text-2); border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; }
.data-table tr:hover td { background: rgba(255,255,255,0.02); }
.customer-cell { display: flex; align-items: center; gap: var(--space-3); }
.cust-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark)); color: var(--color-text-invert); font-weight: 700; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.empty-state { text-align: center; padding: var(--space-12) 0; }
.empty-icon { font-size: 3rem; margin-bottom: var(--space-3); }
</style>
