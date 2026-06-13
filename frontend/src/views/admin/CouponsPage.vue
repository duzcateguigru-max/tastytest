<template>
  <div class="admin-coupons">
    <div class="page-top">
      <h2>Cupones</h2>
      <button class="btn btn-primary" @click="openModal()" id="add-coupon-btn">
        <Plus :size="16" /> Nuevo Cupón
      </button>
    </div>

    <div class="glass-card table-card">
      <div v-if="loading" class="loading-rows">
        <div v-for="n in 5" :key="n" class="skeleton" style="height:52px;border-radius:var(--radius-md);"></div>
      </div>
      <table v-else class="data-table">
        <thead>
          <tr><th>Código</th><th>Tipo</th><th>Descuento</th><th>Mín. Pedido</th><th>Usos</th><th>Expiración</th><th>Estado</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          <tr v-for="c in coupons" :key="c.id">
            <td><code class="code-tag">{{ c.code }}</code></td>
            <td><span class="badge badge-neutral">{{ c.type === 'percent' ? 'Porcentaje' : 'Fijo' }}</span></td>
            <td class="font-bold text-primary">{{ c.type === 'percent' ? c.discount + '%' : '$' + Number(c.discount).toFixed(2) }}</td>
            <td class="text-muted">${{ Number(c.min_total ?? 0).toFixed(2) }}</td>
            <td class="text-muted">{{ c.redemptions ?? 0 }}</td>
            <td class="text-sm text-muted">{{ c.expiry_date ? formatDate(c.expiry_date) : 'Sin expiración' }}</td>
            <td>
              <span :class="`badge badge-${c.status === 1 ? 'success' : 'danger'}`">{{ c.status === 1 ? 'Activo' : 'Inactivo' }}</span>
            </td>
            <td>
              <div class="row-actions">
                <button class="btn btn-ghost btn-sm" @click="openModal(c)" :id="`edit-coupon-${c.id}`"><Pencil :size="14" /></button>
                <button class="btn btn-sm" style="color:var(--color-secondary)" @click="handleDelete(c.id)" :id="`del-coupon-${c.id}`"><Trash2 :size="14" /></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!loading && coupons.length === 0" class="empty-state">
        <div class="empty-icon">🎟️</div>
        <p>No hay cupones todavía — ¡crea uno!</p>
      </div>
    </div>

    <!-- Modal -->
    <Transition name="fade">
      <div class="modal-overlay" v-if="showModal" @click.self="showModal = false">
        <div class="modal glass-card">
          <div class="modal-header">
            <h3>{{ editing ? 'Editar Cupón' : 'Nuevo Cupón' }}</h3>
            <button class="btn btn-ghost btn-icon" @click="showModal = false"><X :size="18" /></button>
          </div>
          <div class="modal-body">
            <div class="form-grid">
              <div class="input-group">
                <label class="input-label">Código *</label>
                <input v-model="form.code" class="input" placeholder="SAVE20" style="text-transform:uppercase;" id="coupon-code-input" />
              </div>
              <div class="input-group">
                <label class="input-label">Tipo</label>
                <select v-model="form.type" class="input" id="coupon-type">
                  <option value="percent">Porcentaje (%)</option>
                  <option value="fixed">Fijo ($)</option>
                </select>
              </div>
            </div>
            <div class="form-grid">
              <div class="input-group">
                <label class="input-label">Descuento {{ form.type === 'percent' ? '(%)' : '($)' }}</label>
                <input v-model.number="form.discount" class="input" type="number" min="0" step="0.01" id="coupon-discount" />
              </div>
              <div class="input-group">
                <label class="input-label">Mín. Pedido ($)</label>
                <input v-model.number="form.min_total" class="input" type="number" min="0" step="0.01" id="coupon-min" />
              </div>
            </div>
            <div class="input-group">
              <label class="input-label">Expiración</label>
              <input v-model="form.expiry_date" class="input" type="date" id="coupon-expiry" />
            </div>
            <div class="input-group toggle-row">
              <label class="input-label">Activo</label>
              <button class="toggle-btn" :class="{ on: form.status === 1 }" @click="form.status = form.status === 1 ? 0 : 1" id="coupon-status-toggle">
                <span class="toggle-knob"></span>
              </button>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" @click="showModal = false">Cancelar</button>
            <button class="btn btn-primary" @click="handleSave" :disabled="saving" id="save-coupon-btn">
              <span v-if="saving" class="spinner"></span>
              <span v-else>{{ editing ? 'Actualizar' : 'Crear' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Pencil, Trash2, X } from '@lucide/vue'
import { couponsApi } from '@/services/api'
import { useToast } from 'vue-toastification'

const toast = useToast()
const coupons = ref<any[]>([])
const loading = ref(true)
const showModal = ref(false)
const editing = ref<number | null>(null)
const saving = ref(false)
const defaultForm = () => ({ code: '', type: 'percent', discount: 10, min_total: 0, expiry_date: '', status: 1 })
const form = ref(defaultForm())

function formatDate(d: string) { return new Date(d).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' }) }

function openModal(c?: any) {
  if (c) { editing.value = c.id; form.value = { code: c.code, type: c.type ?? 'percent', discount: Number(c.discount), min_total: Number(c.min_total ?? 0), expiry_date: c.expiry_date ?? '', status: c.status ?? 1 } }
  else { editing.value = null; form.value = defaultForm() }
  showModal.value = true
}

async function handleSave() {
  if (!form.value.code.trim()) { toast.error('El código es obligatorio'); return }
  saving.value = true
  try {
    if (editing.value) {
      const res = await couponsApi.update(editing.value, form.value)
      const idx = coupons.value.findIndex((c) => c.id === editing.value)
      if (idx !== -1) coupons.value[idx] = res.data.data ?? res.data
      toast.success('Cupón actualizado')
    } else {
      const res = await couponsApi.create(form.value)
      coupons.value.push(res.data.data ?? res.data)
      toast.success('Cupón creado')
    }
    showModal.value = false
  } catch { toast.error('Error al guardar') }
  finally { saving.value = false }
}

async function handleDelete(id: number) {
  if (!confirm('¿Eliminar este cupón?')) return
  try { await couponsApi.delete(id); coupons.value = coupons.value.filter((c) => c.id !== id); toast.success('Cupón eliminado') }
  catch { toast.error('Error al eliminar') }
}

onMounted(async () => {
  try { const res = await couponsApi.getAll({ page_limit: 100 }); coupons.value = res.data.data ?? res.data }
  catch { coupons.value = [] } finally { loading.value = false }
})
</script>

<style scoped>
.admin-coupons { display: flex; flex-direction: column; gap: var(--space-5); }
.page-top { display: flex; align-items: center; justify-content: space-between; }
.page-top h2 { font-size: 1.4rem; }
.table-card { padding: var(--space-5); }
.loading-rows { display: flex; flex-direction: column; gap: var(--space-3); }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-3); padding: var(--space-2) var(--space-3); border-bottom: 1px solid var(--color-border); font-weight: 600; }
.data-table td { padding: var(--space-3) var(--space-3); font-size: 0.875rem; color: var(--color-text-2); border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; }
.data-table tr:hover td { background: rgba(255,255,255,0.02); }
.code-tag { background: var(--color-surface-2); padding: 3px 8px; border-radius: var(--radius-sm); font-family: monospace; font-size: 0.85rem; color: var(--color-primary); letter-spacing: 0.05em; }
.row-actions { display: flex; gap: var(--space-2); }
.empty-state { text-align: center; padding: var(--space-12) 0; }
.empty-icon { font-size: 3rem; margin-bottom: var(--space-3); }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: var(--space-4); }
.modal { width: 100%; max-width: 520px; padding: 0; overflow: hidden; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: var(--space-5) var(--space-6); border-bottom: 1px solid var(--color-border); }
.modal-body { padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-4); }
.modal-footer { padding: var(--space-5) var(--space-6); border-top: 1px solid var(--color-border); display: flex; justify-content: flex-end; gap: var(--space-3); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
.toggle-row { flex-direction: row; align-items: center; justify-content: space-between; }
.toggle-btn { width: 48px; height: 26px; border-radius: var(--radius-full); background: var(--color-surface-2); border: 2px solid var(--color-border); cursor: pointer; position: relative; transition: all var(--transition-fast); }
.toggle-btn.on { background: var(--color-accent); border-color: var(--color-accent); }
.toggle-knob { position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 50%; background: white; transition: transform var(--transition-fast); }
.toggle-btn.on .toggle-knob { transform: translateX(22px); }
@media (max-width: 640px) { .form-grid { grid-template-columns: 1fr; } }
</style>
