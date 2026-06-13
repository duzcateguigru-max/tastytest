<template>
  <div class="cart-page">
    <div class="container">
      <h1>Tu <span class="text-gradient">Carrito</span></h1>

      <div v-if="cart.items.length === 0" class="empty-cart">
        <div class="empty-icon">🛒</div>
        <h2>Tu carrito está vacío</h2>
        <p>Parece que aún no has agregado nada.</p>
        <RouterLink to="/menu" class="btn btn-primary btn-lg" id="browse-menu-btn">Ver Menú</RouterLink>
      </div>

      <div v-else class="cart-layout">
        <!-- ── Items ──────────────────── -->
        <div class="cart-items">
          <div class="cart-item glass-card" v-for="item in cart.items" :key="item.menu_id">
            <div class="cart-item-image">
              <span class="ci-emoji">{{ getEmoji(item.name) }}</span>
            </div>
            <div class="cart-item-info">
              <h4>{{ item.name }}</h4>
              <p class="ci-price">${{ item.price.toFixed(2) }} each</p>
            </div>
            <div class="cart-item-controls">
              <button class="qty-btn" @click="cart.updateQuantity(item.menu_id, item.quantity - 1)" :id="`qty-minus-${item.menu_id}`">
                <Minus :size="14" />
              </button>
              <span class="qty-val">{{ item.quantity }}</span>
              <button class="qty-btn" @click="cart.updateQuantity(item.menu_id, item.quantity + 1)" :id="`qty-plus-${item.menu_id}`">
                <Plus :size="14" />
              </button>
            </div>
            <span class="cart-item-total">${{ (item.price * item.quantity).toFixed(2) }}</span>
            <button class="remove-btn" @click="cart.removeItem(item.menu_id)" :id="`remove-${item.menu_id}`">
              <Trash2 :size="16" />
            </button>
          </div>

          <!-- Coupon -->
          <div class="coupon-section glass-card">
            <div class="coupon-icon">🏷️</div>
            <div class="coupon-input-row">
              <input
                v-model="couponCode"
                type="text"
                class="input"
                placeholder="Ingresa tu cupón"
                id="coupon-input"
              />
              <button class="btn btn-outline" @click="cart.applyCoupon(couponCode)" :disabled="cart.loading" id="apply-coupon-btn">
                Aplicar
              </button>
            </div>
            <button v-if="cart.coupon" class="remove-coupon" @click="cart.removeCoupon()">
              Quitar cupón "{{ cart.coupon.code }}"
            </button>
          </div>
        </div>

        <!-- ── Summary ────────────────── -->
        <div class="cart-summary glass-card">
          <h3>Resumen del Pedido</h3>
          <div class="summary-rows">
            <div class="summary-row">
              <span>Subtotal ({{ cart.itemCount }} artículos)</span>
              <span>${{ cart.subtotal.toFixed(2) }}</span>
            </div>
            <div class="summary-row discount" v-if="cart.coupon">
              <span>Descuento ({{ cart.coupon.code }})</span>
              <span>–${{ cart.discount.toFixed(2) }}</span>
            </div>
            <div class="summary-row">
              <span>Cargo de entrega</span>
              <span :class="{ free: cart.deliveryFee === 0 }">
                {{ cart.deliveryFee === 0 ? 'FREE' : `$${cart.deliveryFee.toFixed(2)}` }}
              </span>
            </div>
            <div v-if="cart.deliveryFee > 0" class="free-delivery-hint">
              ¡Agrega ${{ (30 - cart.subtotal).toFixed(2) }} más para envío gratis!
            </div>
            <div class="summary-divider"></div>
            <div class="summary-row total">
              <span>Total</span>
              <span>${{ cart.total.toFixed(2) }}</span>
            </div>
          </div>

          <RouterLink to="/checkout" class="btn btn-primary btn-lg w-full" id="checkout-btn">
            Proceder al Pago →
          </RouterLink>
          <RouterLink to="/menu" class="btn btn-ghost btn-sm w-full" style="margin-top: var(--space-3);">
            Seguir Comprando
          </RouterLink>

          <div class="security-badges">
            <span>🔒 Pago Seguro</span>
            <span>💳 Todas las Tarjetas Aceptadas</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Plus, Minus, Trash2 } from '@lucide/vue'
import { useCartStore } from '@/stores/cart'

const cart = useCartStore()
const couponCode = ref('')

const emojiMap: Record<string, string> = {
  steak:'🥩', burger:'🍔', pizza:'🍕', pasta:'🍝', salad:'🥗', soup:'🍜',
  chicken:'🍗', fish:'🐟', sushi:'🍣', cake:'🎂', coffee:'☕', lobster:'🦞', taco:'🌮',
}
function getEmoji(name: string) {
  const l = name.toLowerCase()
  return Object.entries(emojiMap).find(([k]) => l.includes(k))?.[1] ?? '🍽️'
}
</script>

<style scoped>
.cart-page { padding: var(--space-12) 0 var(--space-16); }
.cart-page h1 { margin-bottom: var(--space-8); }

.empty-cart {
  text-align: center;
  padding: var(--space-24) 0;
  display: flex; flex-direction: column; align-items: center; gap: var(--space-5);
}
.empty-icon { font-size: 5rem; }

.cart-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: var(--space-8);
  align-items: start;
}

.cart-items { display: flex; flex-direction: column; gap: var(--space-4); }

.cart-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
}
.cart-item-image {
  width: 64px; height: 64px; flex-shrink: 0;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
}
.ci-emoji { font-size: 2rem; }
.cart-item-info { flex: 1; min-width: 0; }
.cart-item-info h4 { font-size: 0.95rem; margin-bottom: 4px; font-family: var(--font-body); }
.ci-price { font-size: 0.8rem; }
.cart-item-controls { display: flex; align-items: center; gap: var(--space-3); }
.qty-btn {
  width: 28px; height: 28px;
  background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 6px;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  color: var(--color-text); transition: all var(--transition-fast);
}
.qty-btn:hover { border-color: var(--color-primary); color: var(--color-primary); }
.qty-val { font-weight: 600; min-width: 20px; text-align: center; }
.cart-item-total { font-weight: 700; color: var(--color-text); min-width: 60px; text-align: right; }
.remove-btn {
  padding: var(--space-2); border-radius: var(--radius-md);
  color: var(--color-text-3); background: none; cursor: pointer;
  transition: all var(--transition-fast);
}
.remove-btn:hover { color: var(--color-secondary); background: var(--color-secondary-dim); }

.coupon-section {
  display: flex; align-items: center; gap: var(--space-4); padding: var(--space-4);
  flex-wrap: wrap;
}
.coupon-icon { font-size: 1.5rem; }
.coupon-input-row { display: flex; gap: var(--space-3); flex: 1; min-width: 0; }
.coupon-input-row .input { flex: 1; }
.remove-coupon {
  font-size: 0.78rem; color: var(--color-secondary); background: none; border: none; cursor: pointer;
  width: 100%; text-align: left; padding: 0;
}

/* ── Summary ───────────────────────────────────── */
.cart-summary {
  padding: var(--space-6);
  display: flex; flex-direction: column; gap: var(--space-5);
  position: sticky; top: calc(var(--navbar-height) + var(--space-4));
}
.cart-summary h3 { font-size: 1.25rem; }
.summary-rows { display: flex; flex-direction: column; gap: var(--space-3); }
.summary-row {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 0.9rem; color: var(--color-text-2);
}
.summary-row.discount { color: var(--color-accent); }
.summary-row.total { font-size: 1.1rem; font-weight: 700; color: var(--color-text); }
.free { color: var(--color-accent); font-weight: 600; }
.free-delivery-hint {
  font-size: 0.78rem; color: var(--color-primary);
  background: var(--color-primary-dim); padding: var(--space-2) var(--space-3); border-radius: var(--radius-md);
}
.summary-divider { height: 1px; background: var(--color-border); }
.security-badges {
  display: flex; gap: var(--space-4); justify-content: center;
  font-size: 0.75rem; color: var(--color-text-3);
}

@media (max-width: 1024px) {
  .cart-layout { grid-template-columns: 1fr; }
  .cart-summary { position: static; }
}
</style>
