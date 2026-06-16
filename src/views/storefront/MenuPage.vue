<template>
  <div class="menu-page">
    <div class="container">
      <div class="menu-header">
        <h1>Nuestro <span class="text-gradient">Menú</span></h1>
        <p>Explora nuestra selección completa — creada con pasión, servida con amor.</p>
      </div>

      <div class="menu-layout">
        <!-- ── Sidebar ──────────────────────── -->
        <aside class="menu-sidebar">
          <div class="sidebar-section">
            <h3 class="sidebar-title">Buscar</h3>
            <div class="search-box">
              <Search :size="16" class="search-icon" />
              <input
                v-model="search"
                type="text"
                placeholder="Buscar platos..."
                class="input search-input"
                id="menu-search"
              />
            </div>
          </div>

          <div class="sidebar-section">
            <h3 class="sidebar-title">Categorías</h3>
            <div class="category-list">
              <button
                class="category-btn"
                :class="{ active: selectedCat === null }"
                @click="selectedCat = null"
                id="cat-all"
              >
                Todos los ítems
                <span class="cat-count">{{ menuStore.items.length }}</span>
              </button>
              <button
                v-for="cat in menuStore.categories"
                :key="cat.id"
                class="category-btn"
                :class="{ active: selectedCat === cat.id }"
                @click="selectedCat = cat.id"
                :id="`cat-${cat.id}`"
              >
                {{ cat.name }}
                <span class="cat-count">{{ getCount(cat.id) }}</span>
              </button>
            </div>
          </div>

          <div class="sidebar-section">
            <h3 class="sidebar-title">Rango de Precio</h3>
            <div class="price-range">
              <input v-model.number="minPrice" type="number" class="input" placeholder="Mín $" min="0" />
              <span>–</span>
              <input v-model.number="maxPrice" type="number" class="input" placeholder="Máx $" min="0" />
            </div>
          </div>

          <div class="sidebar-section">
            <h3 class="sidebar-title">Ordenar por</h3>
            <select v-model="sortBy" class="input" id="menu-sort">
              <option value="default">Predeterminado</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
              <option value="name">Nombre A–Z</option>
            </select>
          </div>
        </aside>

        <!-- ── Items grid ──────────────────── -->
        <main class="menu-main">
          <div class="menu-top-bar">
            <span class="result-count">{{ filtered.length }} ítems</span>
            <div class="view-toggles">
              <button class="view-btn" :class="{ active: view === 'grid' }" @click="view = 'grid'" id="view-grid">
                <Grid :size="16" />
              </button>
              <button class="view-btn" :class="{ active: view === 'list' }" @click="view = 'list'" id="view-list">
                <List :size="16" />
              </button>
            </div>
          </div>

          <div v-if="menuStore.loading" :class="view === 'grid' ? 'items-grid' : 'items-list'">
            <div v-for="n in 12" :key="n" class="item-skeleton">
              <div class="skeleton" style="height:180px;"></div>
              <div style="padding:var(--space-4)">
                <div class="skeleton" style="height:18px; width:60%; margin-bottom:var(--space-2)"></div>
                <div class="skeleton" style="height:14px; margin-bottom:var(--space-3)"></div>
                <div class="skeleton" style="height:36px;"></div>
              </div>
            </div>
          </div>

          <div v-else-if="filtered.length === 0" class="empty-state">
            <div class="empty-icon">🔍</div>
            <h3>No se encontraron ítems</h3>
            <p>Intenta ajustar tu búsqueda o filtros.</p>
          </div>

          <div v-else :class="view === 'grid' ? 'items-grid' : 'items-list'">
            <div
              v-for="item in filtered"
              :key="item.id"
              class="item-card glass-card"
              :class="{ 'list-card': view === 'list' }"
              @click="router.push(`/menu/${item.id}`)"
            >
              <div class="item-image" :class="{ 'list-image': view === 'list' }">
                <div class="food-emoji">{{ getEmoji(item.menu_name) }}</div>
              </div>
              <div class="item-body">
                <div class="item-badges">
                  <span class="badge badge-primary" v-if="Number(item.menu_price) < 15">Selección Económica</span>
                  <span class="badge badge-warning" v-if="Number(item.menu_price) > 40">Premium</span>
                </div>
                <h4 class="item-name">{{ item.menu_name }}</h4>
                <p class="item-desc">{{ item.menu_description || 'Fresco y delicioso.' }}</p>
                <div class="item-footer">
                  <span class="item-price">${{ Number(item.menu_price).toFixed(2) }}</span>
                  <div class="item-actions">
                    <RouterLink :to="`/menu/${item.id}`" class="btn btn-ghost btn-sm" @click.stop>
                      Detalles
                    </RouterLink>
                    <button class="btn btn-primary btn-sm" @click.stop="addToCart(item)" :id="`add-${item.id}`">
                      <Plus :size="14" /> Agregar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { Search, Grid, List, Plus } from '@lucide/vue'
import { useMenuStore } from '@/stores/menu'
import { useCartStore } from '@/stores/cart'

const menuStore = useMenuStore()
const cart = useCartStore()
const router = useRouter()

const search = ref('')
const selectedCat = ref<number | null>(null)
const minPrice = ref<number | null>(null)
const maxPrice = ref<number | null>(null)
const sortBy = ref('default')
const view = ref<'grid' | 'list'>('grid')

const filtered = computed(() => {
  let result = menuStore.items.filter((i) => i.menu_status !== false)
  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter((i) =>
      i.menu_name.toLowerCase().includes(q) ||
      (i.menu_description?.toLowerCase().includes(q) ?? false),
    )
  }
  if (selectedCat.value !== null) result = result.filter((i) => i.menu_category_id === selectedCat.value)
  if (minPrice.value) result = result.filter((i) => Number(i.menu_price) >= minPrice.value!)
  if (maxPrice.value) result = result.filter((i) => Number(i.menu_price) <= maxPrice.value!)
  return [...result].sort((a, b) => {
    if (sortBy.value === 'price-asc') return Number(a.menu_price) - Number(b.menu_price)
    if (sortBy.value === 'price-desc') return Number(b.menu_price) - Number(a.menu_price)
    if (sortBy.value === 'name') return a.menu_name.localeCompare(b.menu_name)
    return 0
  })
})

function getCount(catId: number) {
  return menuStore.items.filter((i) => i.menu_category_id === catId).length
}

const emojiMap: Record<string, string> = {
  steak:'🥩', burger:'🍔', pizza:'🍕', pasta:'🍝', salad:'🥗', soup:'🍜',
  chicken:'🍗', fish:'🐟', sushi:'🍣', cake:'🎂', ice:'🍦', coffee:'☕',
  cocktail:'🍹', wine:'🍷', lobster:'🦞', shrimp:'🍤', taco:'🌮',
}
function getEmoji(name: string) {
  const l = name.toLowerCase()
  return Object.entries(emojiMap).find(([k]) => l.includes(k))?.[1] ?? '🍽️'
}

function addToCart(item: any) {
  cart.addItem({ id: item.id, menu_id: item.id, name: item.menu_name, price: Number(item.menu_price) })
}

onMounted(async () => {
  if (!menuStore.items.length) await menuStore.fetchItems()
  if (!menuStore.categories.length) await menuStore.fetchCategories()
})
</script>

<style scoped>
.menu-page { padding-top: var(--space-12); padding-bottom: var(--space-16); }
.menu-header { text-align: center; margin-bottom: var(--space-10); }
.menu-header h1 { margin-bottom: var(--space-3); }

.menu-layout { display: grid; grid-template-columns: 260px 1fr; gap: var(--space-8); }

/* ── Sidebar ───────────────────────────────────── */
.menu-sidebar { position: sticky; top: calc(var(--navbar-height) + var(--space-4)); height: fit-content; display: flex; flex-direction: column; gap: var(--space-6); }
.sidebar-section { display: flex; flex-direction: column; gap: var(--space-3); }
.sidebar-title { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-text-2); font-family: var(--font-body); }

.search-box { position: relative; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--color-text-3); }
.search-input { padding-left: 36px; }

.category-list { display: flex; flex-direction: column; gap: var(--space-1); }
.category-btn {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: 0.875rem; color: var(--color-text-2);
  transition: all var(--transition-fast); background: none; border: none; cursor: pointer; text-align: left; width: 100%;
}
.category-btn:hover { color: var(--color-text); background: rgba(255,255,255,0.06); }
.category-btn.active { color: var(--color-primary); background: var(--color-primary-dim); }
.cat-count {
  font-size: 0.72rem; font-weight: 600;
  background: var(--color-surface-2);
  padding: 2px 8px; border-radius: var(--radius-full);
}

.price-range { display: flex; align-items: center; gap: var(--space-3); }
.price-range .input { flex: 1; }

/* ── Main ──────────────────────────────────────── */
.menu-main { display: flex; flex-direction: column; gap: var(--space-6); }
.menu-top-bar { display: flex; align-items: center; justify-content: space-between; }
.result-count { font-size: 0.875rem; color: var(--color-text-2); }
.view-toggles { display: flex; gap: var(--space-2); }
.view-btn {
  padding: var(--space-2) var(--space-3); border-radius: var(--radius-md);
  color: var(--color-text-3); background: var(--color-surface); border: 1px solid var(--color-border);
  cursor: pointer; transition: all var(--transition-fast);
}
.view-btn.active { color: var(--color-primary); background: var(--color-primary-dim); border-color: var(--color-primary); }

.items-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-5); }
.items-list { display: flex; flex-direction: column; gap: var(--space-4); }
.item-skeleton { border-radius: var(--radius-xl); overflow: hidden; background: var(--color-surface); }

.item-card { overflow: hidden; cursor: pointer; }
.list-card { display: flex; }

.item-image {
  height: 180px;
  background: linear-gradient(135deg, var(--color-surface), var(--color-surface-2));
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.list-image { width: 160px; height: auto; min-height: 140px; }
.food-emoji { font-size: 3.5rem; }
.item-body { padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-3); flex: 1; }
.item-badges { display: flex; gap: var(--space-2); flex-wrap: wrap; min-height: 22px; }
.item-name { font-size: 1rem; font-weight: 600; color: var(--color-text); font-family: var(--font-body); }
.item-desc {
  font-size: 0.8rem; color: var(--color-text-3); line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.item-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; }
.item-price { font-size: 1.15rem; font-weight: 700; color: var(--color-primary); }
.item-actions { display: flex; gap: var(--space-2); }

.empty-state { text-align: center; padding: var(--space-20) 0; }
.empty-icon { font-size: 4rem; margin-bottom: var(--space-4); }
.empty-state h3 { margin-bottom: var(--space-2); }

@media (max-width: 1024px) {
  .menu-layout { grid-template-columns: 1fr; }
  .menu-sidebar { position: static; }
  .items-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .items-grid { grid-template-columns: 1fr; }
}
</style>
