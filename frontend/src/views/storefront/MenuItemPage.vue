<template>
  <div class="item-page">
    <div class="container">
      <RouterLink to="/menu" class="back-link">
        <ChevronLeft :size="18" /> Volver al Menú
      </RouterLink>

      <div v-if="loading" class="item-detail-skeleton">
        <div class="skeleton" style="height:360px; border-radius: var(--radius-2xl);"></div>
        <div style="display:flex; flex-direction:column; gap:var(--space-4); padding-top:var(--space-4)">
          <div class="skeleton" style="height:36px; width:60%;"></div>
          <div class="skeleton" style="height:16px;"></div>
          <div class="skeleton" style="height:16px; width:80%;"></div>
          <div class="skeleton" style="height:50px; margin-top:var(--space-6);"></div>
        </div>
      </div>

      <div v-else-if="item" class="item-detail">
        <!-- Image -->
        <div class="item-visual glass-card">
          <div class="item-emoji">{{ getEmoji(item.menu_name) }}</div>
          <div class="item-tags">
            <span class="badge badge-primary" v-if="Number(item.menu_price) < 15">Oferta</span>
            <span class="badge badge-success">Disponible</span>
            <span class="badge badge-warning" v-if="Number(item.menu_price) > 40">Premium</span>
          </div>
        </div>

        <!-- Info -->
        <div class="item-info">
          <div class="item-header">
            <div>
              <span class="item-category">{{ getCategoryName(item.menu_category_id) }}</span>
              <h1>{{ item.menu_name }}</h1>
            </div>
            <div class="item-price-block">
              <span class="price-label">Precio</span>
              <span class="price-value">${{ Number(item.menu_price).toFixed(2) }}</span>
            </div>
          </div>

          <p class="item-description">{{ item.menu_description || 'Un plato magistral elaborado con los ingredientes de temporada más selectos por nuestro galardonado equipo culinario. Perfecto para cualquier ocasión.' }}</p>

          <div class="item-details-grid">
            <div class="detail-card glass-card">⏱️ <span>20–30 min prep</span></div>
            <div class="detail-card glass-card">🔥 <span>~650 cal</span></div>
            <div class="detail-card glass-card">🌿 <span>Ingredientes frescos</span></div>
            <div class="detail-card glass-card">⭐ <span>4.8 valoración</span></div>
          </div>

          <!-- Quantity -->
          <div class="quantity-section">
            <label class="sidebar-title">Cantidad</label>
            <div class="qty-control">
              <button class="qty-btn" @click="qty = Math.max(1, qty - 1)" id="qty-minus">
                <Minus :size="16" />
              </button>
              <span class="qty-value">{{ qty }}</span>
              <button class="qty-btn" @click="qty++" id="qty-plus">
                <Plus :size="16" />
              </button>
            </div>
          </div>

          <!-- Notes -->
          <div class="input-group">
            <label class="input-label">Instrucciones especiales (opcional)</label>
            <textarea v-model="notes" class="input" rows="3" placeholder="Alergias, preferencias..."></textarea>
          </div>

          <!-- CTA -->
          <div class="item-cta">
            <button class="btn btn-primary btn-lg w-full" @click="handleAddToCart" id="add-to-cart-btn">
              <ShoppingCart :size="18" />
              Agregar {{ qty }} al carrito — ${{ (Number(item.menu_price) * qty).toFixed(2) }}
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">😕</div>
        <h3>Artículo no encontrado</h3>
        <RouterLink to="/menu" class="btn btn-primary">Explorar Menú</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ChevronLeft, ShoppingCart, Plus, Minus } from '@lucide/vue'
import { useMenuStore } from '@/stores/menu'
import { useCartStore } from '@/stores/cart'
import { menuApi } from '@/services/api'

const route = useRoute()
const router = useRouter()
const menuStore = useMenuStore()
const cart = useCartStore()

const item = ref<any>(null)
const loading = ref(true)
const qty = ref(1)
const notes = ref('')

const emojiMap: Record<string, string> = {
  steak:'🥩', burger:'🍔', pizza:'🍕', pasta:'🍝', salad:'🥗', soup:'🍜',
  chicken:'🍗', fish:'🐟', sushi:'🍣', cake:'🎂', ice:'🍦', coffee:'☕',
  lobster:'🦞', shrimp:'🍤', taco:'🌮',
}
function getEmoji(name: string) {
  const l = name.toLowerCase()
  return Object.entries(emojiMap).find(([k]) => l.includes(k))?.[1] ?? '🍽️'
}

function getCategoryName(id: number) {
  return menuStore.categories.find((c) => c.id === id)?.name ?? 'Menu Item'
}

function handleAddToCart() {
  if (!item.value) return
  cart.addItem({ id: item.value.id, menu_id: item.value.id, name: item.value.menu_name, price: Number(item.value.menu_price) }, qty.value)
  router.push('/cart')
}

onMounted(async () => {
  const id = Number(route.params.id)
  const found = menuStore.items.find((i) => i.id === id)
  if (found) {
    item.value = found
  } else {
    try {
      const res = await menuApi.getItem(id)
      item.value = res.data.data ?? res.data
    } catch {}
  }
  if (!menuStore.categories.length) await menuStore.fetchCategories()
  loading.value = false
})
</script>

<style scoped>
.item-page { padding: var(--space-8) 0 var(--space-16); }
.back-link {
  display: inline-flex; align-items: center; gap: var(--space-2);
  color: var(--color-text-2); font-size: 0.875rem;
  transition: color var(--transition-fast);
  margin-bottom: var(--space-8);
}
.back-link:hover { color: var(--color-primary); }

.item-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-12);
  align-items: start;
}
.item-detail-skeleton { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-12); }

.item-visual {
  display: flex; align-items: center; justify-content: center;
  min-height: 360px; position: relative;
  background: linear-gradient(135deg, var(--color-surface), var(--color-bg-3));
  flex-direction: column;
  gap: var(--space-4);
}
.item-emoji { font-size: 10rem; }
.item-tags { display: flex; gap: var(--space-2); }

.item-info { display: flex; flex-direction: column; gap: var(--space-6); }
.item-header { display: flex; justify-content: space-between; align-items: flex-start; gap: var(--space-4); }
.item-category {
  font-size: 0.78rem; font-weight: 600; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--color-primary);
  display: block; margin-bottom: var(--space-2);
}
.item-header h1 { font-size: 2rem; }
.price-label { font-size: 0.75rem; color: var(--color-text-3); display: block; text-align: right; }
.price-value { font-size: 2rem; font-weight: 700; color: var(--color-primary); font-family: var(--font-heading); }
.item-description { font-size: 1rem; line-height: 1.8; }

.item-details-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-3);
}
.detail-card {
  display: flex; align-items: center; gap: var(--space-2);
  padding: var(--space-3); font-size: 0.8rem; color: var(--color-text-2);
}

.quantity-section { display: flex; align-items: center; gap: var(--space-4); }
.sidebar-title { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-text-2); white-space: nowrap; }
.qty-control { display: flex; align-items: center; gap: var(--space-3); }
.qty-btn {
  width: 36px; height: 36px;
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius-md); color: var(--color-text);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all var(--transition-fast);
}
.qty-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
.qty-value { font-size: 1.25rem; font-weight: 700; min-width: 32px; text-align: center; }

.empty-state { text-align: center; padding: var(--space-20) 0; }
.empty-icon { font-size: 4rem; margin-bottom: var(--space-4); }

@media (max-width: 768px) {
  .item-detail { grid-template-columns: 1fr; }
  .item-detail-skeleton { grid-template-columns: 1fr; }
  .item-details-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
