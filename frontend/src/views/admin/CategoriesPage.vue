<template>
  <div class="admin-categories">
    <div class="page-top">
      <h2>Categorías</h2>
      <button class="btn btn-primary" @click="openModal()" id="add-cat-btn">
        <Plus :size="16" /> Nueva Categoría
      </button>
    </div>

    <div class="glass-card table-card">
      <div v-if="loading" class="loading-rows">
        <div v-for="n in 6" :key="n" class="skeleton" style="height:52px;border-radius:var(--radius-md);"></div>
      </div>
      <table v-else class="data-table">
        <thead>
          <tr><th>#</th><th>Nombre</th><th>Descripción</th><th>Items</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          <tr v-for="cat in categories" :key="cat.id">
            <td class="text-muted">{{ cat.id }}</td>
            <td class="font-bold">{{ cat.name }}</td>
            <td class="text-muted text-sm">{{ cat.description || '—' }}</td>
            <td>
              <span class="badge badge-neutral">{{ getCount(cat.id) }}</span>
            </td>
            <td>
              <div class="row-actions">
                <button class="btn btn-ghost btn-sm" @click="openModal(cat)" :id="`edit-cat-${cat.id}`">
                  <Pencil :size="14" /> Editar
                </button>
                <button class="btn btn-sm" style="color:var(--color-secondary)" @click="handleDelete(cat.id)" :id="`del-cat-${cat.id}`">
                  <Trash2 :size="14" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <Transition name="fade">
      <div class="modal-overlay" v-if="showModal" @click.self="showModal = false">
        <div class="modal glass-card">
          <div class="modal-header">
            <h3>{{ editing ? 'Editar Categoría' : 'Nueva Categoría' }}</h3>
            <button class="btn btn-ghost btn-icon" @click="showModal = false"><X :size="18" /></button>
          </div>
          <div class="modal-body">
            <div class="input-group">
              <label class="input-label">Nombre de la Categoría *</label>
              <input v-model="form.name" class="input" placeholder="e.g. Entrantes" id="cat-name-input" />
            </div>
            <div class="input-group">
              <label class="input-label">Descripción</label>
              <textarea v-model="form.description" class="input" rows="3" placeholder="Breve descripción..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" @click="showModal = false">Cancelar</button>
            <button class="btn btn-primary" @click="handleSave" :disabled="saving" id="save-cat-btn">
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
import { useMenuStore, type Category } from '@/stores/menu'
import { categoriesApi } from '@/services/api'
import { useToast } from 'vue-toastification'

const menuStore = useMenuStore()
const toast = useToast()
const categories = ref<Category[]>([])
const loading = ref(true)
const showModal = ref(false)
const editing = ref<number | null>(null)
const saving = ref(false)
const form = ref({ name: '', description: '' })

function getCount(id: number) { return menuStore.items.filter((i) => i.menu_category_id === id).length }

function openModal(cat?: Category) {
  if (cat) { editing.value = cat.id; form.value = { name: cat.name, description: cat.description ?? '' } }
  else { editing.value = null; form.value = { name: '', description: '' } }
  showModal.value = true
}

async function handleSave() {
  if (!form.value.name.trim()) { toast.error('El nombre es requerido'); return }
  saving.value = true
  try {
    if (editing.value) {
      await categoriesApi.update(editing.value, form.value)
      const idx = categories.value.findIndex((c) => c.id === editing.value)
      if (idx !== -1) categories.value[idx] = { ...categories.value[idx], ...form.value }
      toast.success('Categoría actualizada')
    } else {
      const res = await categoriesApi.create(form.value)
      categories.value.push(res.data.data ?? res.data)
      toast.success('Categoría creada')
    }
    showModal.value = false
  } catch { toast.error('Error al guardar') }
  finally { saving.value = false }
}

async function handleDelete(id: number) {
  if (!confirm('¿Eliminar esta categoría?')) return
  try { await categoriesApi.delete(id); categories.value = categories.value.filter((c) => c.id !== id); toast.success('Eliminado') }
  catch { toast.error('Error al eliminar') }
}

onMounted(async () => {
  const res = await categoriesApi.getAll({ page_limit: 100 })
  categories.value = res.data.data ?? res.data
  if (!menuStore.items.length) await menuStore.fetchItems()
  loading.value = false
})
</script>

<style scoped>
.admin-categories { display: flex; flex-direction: column; gap: var(--space-5); }
.page-top { display: flex; align-items: center; justify-content: space-between; }
.page-top h2 { font-size: 1.4rem; }
.table-card { padding: var(--space-5); }
.loading-rows { display: flex; flex-direction: column; gap: var(--space-3); }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: left; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-3); padding: var(--space-2) var(--space-3); border-bottom: 1px solid var(--color-border); font-weight: 600; }
.data-table td { padding: var(--space-3) var(--space-3); font-size: 0.875rem; color: var(--color-text-2); border-bottom: 1px solid rgba(255,255,255,0.04); }
.data-table tr:hover td { background: rgba(255,255,255,0.02); }
.row-actions { display: flex; gap: var(--space-2); }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: var(--space-4); }
.modal { width: 100%; max-width: 480px; padding: 0; overflow: hidden; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: var(--space-5) var(--space-6); border-bottom: 1px solid var(--color-border); }
.modal-body { padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-4); }
.modal-footer { padding: var(--space-5) var(--space-6); border-top: 1px solid var(--color-border); display: flex; justify-content: flex-end; gap: var(--space-3); }
</style>
