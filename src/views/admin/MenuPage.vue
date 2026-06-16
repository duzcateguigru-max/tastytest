<template>
  <div class="admin-menu">
    <div class="page-top">
      <h2>Gestión de Menú</h2>
      <button class="btn btn-primary" @click="openModal()" id="add-item-btn">
        <Plus :size="16" /> Agregar Plato
      </button>
    </div>

    <!-- Search -->
    <div class="filters-bar glass-card">
      <input v-model="search" class="input" placeholder="Buscar platos..." style="max-width:300px;" id="menu-search" />
      <select v-model="catFilter" class="input" style="max-width:200px;" id="cat-filter">
        <option value="">Todas las Categorías</option>
        <option v-for="c in menuStore.categories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
      <span class="filter-count">{{ filtered.length }} platos</span>
    </div>

    <!-- Grid -->
    <div v-if="menuStore.loading" class="items-grid">
      <div v-for="n in 8" :key="n" class="item-skeleton glass-card">
        <div class="skeleton" style="height:160px;border-radius:var(--radius-xl) var(--radius-xl) 0 0;"></div>
        <div style="padding:var(--space-4);display:flex;flex-direction:column;gap:var(--space-3)">
          <div class="skeleton" style="height:18px;width:70%;"></div>
          <div class="skeleton" style="height:14px;"></div>
          <div class="skeleton" style="height:32px;"></div>
        </div>
      </div>
    </div>

    <div v-else class="items-grid">
      <div v-for="item in filtered" :key="item.id" class="menu-item-card glass-card">
        <div class="item-image">
          <div class="item-emoji">{{ getEmoji(item.menu_name) }}</div>
          <div class="item-status-dot" :class="item.menu_status ? 'active' : 'inactive'"></div>
        </div>
        <div class="item-body">
          <div class="item-cat">{{ getCatName(item.menu_category_id) }}</div>
          <h4>{{ item.menu_name }}</h4>
          <p class="item-desc">{{ item.menu_description || '—' }}</p>
          <div class="item-footer">
            <span class="item-price">${{ Number(item.menu_price).toFixed(2) }}</span>
            <div class="item-actions">
              <button class="btn btn-ghost btn-sm" @click="openModal(item)" :id="`edit-${item.id}`">
                <Pencil :size="14" />
              </button>
              <button class="btn btn-sm" style="color:var(--color-secondary)" @click="handleDelete(item.id)" :id="`delete-${item.id}`">
                <Trash2 :size="14" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Transition name="fade">
      <div class="modal-overlay" v-if="showModal" @click.self="showModal = false">
        <div class="modal glass-card">
          <div class="modal-header">
            <h3>{{ editing ? 'Editar Plato' : 'Nuevo Plato' }}</h3>
            <button class="btn btn-ghost btn-icon" @click="showModal = false"><X :size="18" /></button>
          </div>
          <div class="modal-body">
            <div class="form-grid">
              <div class="input-group">
                <label class="input-label">Nombre del Plato *</label>
                <input v-model="form.menu_name" class="input" placeholder="Ej: Wagyu Burger" id="form-name" />
              </div>
              <div class="input-group">
                <label class="input-label">Precio ($) *</label>
                <input v-model.number="form.menu_price" class="input" type="number" min="0" step="0.01" placeholder="0.00" id="form-price" />
              </div>
            </div>
            <div class="input-group">
              <label class="input-label">Categoría</label>
              <select v-model.number="form.menu_category_id" class="input" id="form-cat">
                <option v-for="c in menuStore.categories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div class="input-group">
              <label class="input-label">Descripción</label>
              <textarea v-model="form.menu_description" class="input" rows="3" placeholder="Describe este plato..."></textarea>
            </div>
            <div class="input-group toggle-row">
              <label class="input-label">Disponible</label>
              <button class="toggle-btn" :class="{ on: form.menu_status }" @click="form.menu_status = !form.menu_status" id="form-status">
                <span class="toggle-knob"></span>
              </button>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" @click="showModal = false">Cancelar</button>
            <button class="btn btn-primary" @click="handleSave" :disabled="saving" id="save-item-btn">
              <span v-if="saving" class="spinner"></span>
              <span v-else>{{ editing ? 'Actualizar Plato' : 'Agregar Plato' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Pencil, Trash2, X } from '@lucide/vue'
import { useMenuStore, type MenuItem } from '@/stores/menu'
import { useToast } from 'vue-toastification'

const menuStore = useMenuStore()
const toast = useToast()
const search = ref('')
const catFilter = ref<number | ''>('')
const showModal = ref(false)
const editing = ref<number | null>(null)
const saving = ref(false)

const defaultForm = () => ({ menu_name: '', menu_price: 0, menu_category_id: 0, menu_description: '', menu_status: true })
const form = ref(defaultForm())

const filtered = computed(() => {
  return menuStore.items.filter((i) => {
    const q = search.value.toLowerCase()
    const ms = !q || i.menu_name.toLowerCase().includes(q) || (i.menu_description ?? '').toLowerCase().includes(q)
    const mc = !catFilter.value || i.menu_category_id === catFilter.value
    return ms && mc
  })
})

function getCatName(id: number) { return menuStore.categories.find((c) => c.id === id)?.name ?? '' }

const emojiMap: Record<string, string> = { steak:'🥩', burger:'🍔', pizza:'🍕', pasta:'🍝', salad:'🥗', soup:'🍜', chicken:'🍗', fish:'🐟', sushi:'🍣', cake:'🎂', coffee:'☕', lobster:'🦞', taco:'🌮' }
function getEmoji(name: string) { const l = name.toLowerCase(); return Object.entries(emojiMap).find(([k]) => l.includes(k))?.[1] ?? '🍽️' }

function openModal(item?: MenuItem) {
  if (item) {
    editing.value = item.id
    form.value = { menu_name: item.menu_name, menu_price: Number(item.menu_price), menu_category_id: item.menu_category_id, menu_description: item.menu_description ?? '', menu_status: item.menu_status ?? true }
  } else {
    editing.value = null
    form.value = defaultForm()
    if (menuStore.categories[0]) form.value.menu_category_id = menuStore.categories[0].id
  }
  showModal.value = true
}

async function handleSave() {
  if (!form.value.menu_name.trim()) { toast.error('El nombre es obligatorio'); return }
  saving.value = true
  try {
    if (editing.value) { await menuStore.updateItem(editing.value, form.value); toast.success('Plato actualizado!') }
    else { await menuStore.createItem(form.value); toast.success('Plato agregado!') }
    showModal.value = false
  } catch { toast.error('Error al guardar el plato') }
  finally { saving.value = false }
}

async function handleDelete(id: number) {
  if (!confirm('¿Eliminar este plato?')) return
  try { await menuStore.deleteItem(id); toast.success('Plato eliminado') }
  catch { toast.error('Error al eliminar el plato') }
}

onMounted(async () => {
  await Promise.all([menuStore.fetchItems(), menuStore.fetchCategories()])
})
</script>

<style scoped>
.admin-menu { display: flex; flex-direction: column; gap: var(--space-5); }
.page-top { display: flex; align-items: center; justify-content: space-between; }
.page-top h2 { font-size: 1.4rem; }
.filters-bar { padding: var(--space-4) var(--space-5); display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap; }
.filter-count { margin-left: auto; font-size: 0.85rem; color: var(--color-text-3); }
.items-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-5); }
.item-skeleton { border-radius: var(--radius-xl); overflow: hidden; }
.menu-item-card { overflow: hidden; }
.item-image { height: 140px; background: linear-gradient(135deg, var(--color-surface), var(--color-bg-3)); display: flex; align-items: center; justify-content: center; position: relative; }
.item-emoji { font-size: 3rem; }
.item-status-dot { position: absolute; top: 10px; right: 10px; width: 10px; height: 10px; border-radius: 50%; }
.item-status-dot.active { background: var(--color-accent); box-shadow: 0 0 8px var(--color-accent); }
.item-status-dot.inactive { background: var(--color-secondary); }
.item-body { padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-2); }
.item-cat { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-primary); font-weight: 600; }
.item-body h4 { font-size: 0.95rem; font-family: var(--font-body); }
.item-desc { font-size: 0.78rem; color: var(--color-text-3); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.item-footer { display: flex; align-items: center; justify-content: space-between; margin-top: var(--space-2); }
.item-price { font-weight: 700; color: var(--color-primary); }
.item-actions { display: flex; gap: var(--space-1); }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: var(--space-4); }
.modal { width: 100%; max-width: 540px; padding: 0; overflow: hidden; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: var(--space-5) var(--space-6); border-bottom: 1px solid var(--color-border); }
.modal-header h3 { font-size: 1.1rem; }
.modal-body { padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-4); }
.modal-footer { padding: var(--space-5) var(--space-6); border-top: 1px solid var(--color-border); display: flex; justify-content: flex-end; gap: var(--space-3); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
.toggle-row { flex-direction: row; align-items: center; justify-content: space-between; }
.toggle-btn { width: 48px; height: 26px; border-radius: var(--radius-full); background: var(--color-surface-2); border: 2px solid var(--color-border); cursor: pointer; position: relative; transition: all var(--transition-fast); }
.toggle-btn.on { background: var(--color-accent); border-color: var(--color-accent); }
.toggle-knob { position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 50%; background: white; transition: transform var(--transition-fast); }
.toggle-btn.on .toggle-knob { transform: translateX(22px); }

@media (max-width: 1280px) { .items-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 1024px) { .items-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) { .items-grid { grid-template-columns: 1fr; } .form-grid { grid-template-columns: 1fr; } }
</style>
