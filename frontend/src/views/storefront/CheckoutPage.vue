<template>
  <div class="checkout-page">
    <div class="container">
      <RouterLink to="/cart" class="back-link">
        <ChevronLeft :size="18" /> Back to Cart
      </RouterLink>
      <h1>Checkout</h1>

      <div class="checkout-layout">
        <!-- ── Form ─────────────────────────── -->
        <div class="checkout-form">
          <!-- Step indicator -->
          <div class="steps-indicator">
            <div v-for="(step, i) in checkoutSteps" :key="i" class="step-indicator-item" :class="{ active: currentStep >= i, done: currentStep > i }">
              <div class="step-dot">{{ currentStep > i ? '✓' : i + 1 }}</div>
              <span>{{ step }}</span>
            </div>
          </div>

          <!-- Step 1: Order type -->
          <div v-if="currentStep === 0" class="step-content glass-card">
            <h3>Order Type</h3>
            <div class="order-type-cards">
              <button
                class="type-card"
                :class="{ active: form.order_type === 'delivery' }"
                @click="form.order_type = 'delivery'"
                id="type-delivery"
              >
                <span class="type-icon">🚚</span>
                <span class="type-label">Delivery</span>
                <span class="type-desc">30–45 min</span>
              </button>
              <button
                class="type-card"
                :class="{ active: form.order_type === 'collection' }"
                @click="form.order_type = 'collection'"
                id="type-pickup"
              >
                <span class="type-icon">🏪</span>
                <span class="type-label">Pickup</span>
                <span class="type-desc">15–20 min</span>
              </button>
            </div>

            <div v-if="form.order_type === 'delivery'" class="input-group">
              <label class="input-label">Delivery Address</label>
              <input v-model="form.address" class="input" placeholder="123 Main St, City" id="delivery-address" />
              <input v-model="form.city" class="input" placeholder="City" style="margin-top: var(--space-2);" />
              <input v-model="form.postcode" class="input" placeholder="ZIP / Postal Code" style="margin-top: var(--space-2);" />
            </div>

            <button class="btn btn-primary btn-lg w-full" @click="currentStep = 1" id="next-step-1">
              Continue →
            </button>
          </div>

          <!-- Step 2: Contact -->
          <div v-if="currentStep === 1" class="step-content glass-card">
            <h3>Contact Details</h3>
            <div class="form-grid">
              <div class="input-group">
                <label class="input-label">First Name</label>
                <input v-model="form.first_name" class="input" placeholder="John" id="first-name" />
              </div>
              <div class="input-group">
                <label class="input-label">Last Name</label>
                <input v-model="form.last_name" class="input" placeholder="Doe" id="last-name" />
              </div>
            </div>
            <div class="input-group">
              <label class="input-label">Phone Number</label>
              <input v-model="form.telephone" class="input" type="tel" placeholder="+1 (555) 000-0000" id="phone" />
            </div>
            <div class="input-group">
              <label class="input-label">Special Instructions</label>
              <textarea v-model="form.comment" class="input" rows="3" placeholder="Allergies, access notes..."></textarea>
            </div>
            <div class="step-buttons">
              <button class="btn btn-ghost" @click="currentStep = 0">← Back</button>
              <button class="btn btn-primary" @click="currentStep = 2" id="next-step-2">Continue →</button>
            </div>
          </div>

          <!-- Step 3: Payment & Review -->
          <div v-if="currentStep === 2" class="step-content glass-card">
            <h3>Payment Method</h3>
            <div class="payment-options">
              <button
                v-for="p in paymentMethods"
                :key="p.id"
                class="payment-card"
                :class="{ active: form.payment_method === p.id }"
                @click="form.payment_method = p.id"
                :id="`payment-${p.id}`"
              >
                <span>{{ p.icon }}</span>
                <span>{{ p.label }}</span>
              </button>
            </div>
            <div class="step-buttons">
              <button class="btn btn-ghost" @click="currentStep = 1">← Back</button>
              <button class="btn btn-primary btn-lg" @click="placeOrder" :disabled="orders.loading" id="place-order-btn">
                <span v-if="orders.loading" class="spinner"></span>
                <span v-else>🎉 Place Order — ${{ cart.total.toFixed(2) }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- ── Order summary ──────────────────── -->
        <div class="checkout-summary glass-card">
          <h3>Order Summary</h3>
          <div class="order-items">
            <div v-for="item in cart.items" :key="item.menu_id" class="order-item">
              <span class="oi-name">{{ item.name }} ×{{ item.quantity }}</span>
              <span class="oi-price">${{ (item.price * item.quantity).toFixed(2) }}</span>
            </div>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-row"><span>Subtotal</span><span>${{ cart.subtotal.toFixed(2) }}</span></div>
          <div class="summary-row" v-if="cart.coupon" style="color: var(--color-accent);">
            <span>Discount</span><span>–${{ cart.discount.toFixed(2) }}</span>
          </div>
          <div class="summary-row">
            <span>Delivery</span>
            <span>{{ cart.deliveryFee === 0 ? 'FREE' : `$${cart.deliveryFee.toFixed(2)}` }}</span>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-row total"><span>Total</span><span>${{ cart.total.toFixed(2) }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ChevronLeft } from 'lucide-vue-next'
import { useCartStore } from '@/stores/cart'
import { useOrdersStore } from '@/stores/orders'
import { useToast } from 'vue-toastification'

const cart = useCartStore()
const orders = useOrdersStore()
const router = useRouter()
const toast = useToast()

const currentStep = ref(0)
const checkoutSteps = ['Order Type', 'Contact', 'Payment']

const form = ref({
  order_type: 'delivery' as 'delivery' | 'collection',
  address: '', city: '', postcode: '',
  first_name: '', last_name: '', telephone: '', comment: '',
  payment_method: 'cash',
})

const paymentMethods = [
  { id: 'cash',   icon: '💵', label: 'Cash on Delivery' },
  { id: 'card',   icon: '💳', label: 'Credit / Debit Card' },
  { id: 'paypal', icon: '🅿️', label: 'PayPal' },
]

async function placeOrder() {
  try {
    const order = await orders.placeOrder({ ...form.value })
    toast.success('Order placed successfully! 🎉')
    router.push(`/orders/${order.id}`)
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? 'Failed to place order')
  }
}
</script>

<style scoped>
.checkout-page { padding: var(--space-8) 0 var(--space-16); }
.checkout-page h1 { margin-bottom: var(--space-8); }
.back-link {
  display: inline-flex; align-items: center; gap: var(--space-2);
  color: var(--color-text-2); font-size: 0.875rem; margin-bottom: var(--space-6);
  transition: color var(--transition-fast);
}
.back-link:hover { color: var(--color-primary); }

.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: var(--space-8);
  align-items: start;
}

.steps-indicator {
  display: flex;
  gap: var(--space-6);
  margin-bottom: var(--space-6);
  align-items: center;
}
.step-indicator-item {
  display: flex; align-items: center; gap: var(--space-3);
  font-size: 0.875rem; color: var(--color-text-3);
}
.step-indicator-item.active { color: var(--color-text); }
.step-indicator-item.done { color: var(--color-accent); }
.step-dot {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: var(--color-surface); border: 2px solid var(--color-border);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700; flex-shrink: 0;
}
.step-indicator-item.active .step-dot { border-color: var(--color-primary); color: var(--color-primary); }
.step-indicator-item.done .step-dot { background: var(--color-accent); border-color: var(--color-accent); color: white; }

.step-content { padding: var(--space-8); display: flex; flex-direction: column; gap: var(--space-5); }
.step-content h3 { font-family: var(--font-heading); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }

.order-type-cards { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
.type-card {
  padding: var(--space-5);
  background: var(--color-surface); border: 2px solid var(--color-border);
  border-radius: var(--radius-lg); cursor: pointer;
  display: flex; flex-direction: column; align-items: center; gap: var(--space-2);
  transition: all var(--transition-fast);
}
.type-card:hover { border-color: var(--color-border-hover); }
.type-card.active { border-color: var(--color-primary); background: var(--color-primary-dim); }
.type-icon { font-size: 2rem; }
.type-label { font-weight: 600; font-size: 0.95rem; color: var(--color-text); }
.type-desc { font-size: 0.78rem; color: var(--color-text-3); }

.payment-options { display: flex; flex-direction: column; gap: var(--space-3); }
.payment-card {
  display: flex; align-items: center; gap: var(--space-4);
  padding: var(--space-4); background: var(--color-surface);
  border: 2px solid var(--color-border); border-radius: var(--radius-lg);
  cursor: pointer; transition: all var(--transition-fast);
  font-size: 0.95rem; color: var(--color-text);
}
.payment-card:hover { border-color: var(--color-border-hover); }
.payment-card.active { border-color: var(--color-primary); background: var(--color-primary-dim); }
.payment-card span:first-child { font-size: 1.5rem; }

.step-buttons { display: flex; gap: var(--space-4); justify-content: flex-end; margin-top: var(--space-2); }

/* Summary */
.checkout-summary {
  padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-4);
  position: sticky; top: calc(var(--navbar-height) + var(--space-4));
}
.order-items { display: flex; flex-direction: column; gap: var(--space-3); }
.order-item { display: flex; justify-content: space-between; font-size: 0.875rem; }
.oi-name { color: var(--color-text-2); }
.oi-price { font-weight: 600; }
.summary-row {
  display: flex; justify-content: space-between;
  font-size: 0.9rem; color: var(--color-text-2);
}
.summary-row.total { font-size: 1.1rem; font-weight: 700; color: var(--color-text); }
.summary-divider { height: 1px; background: var(--color-border); }

@media (max-width: 1024px) {
  .checkout-layout { grid-template-columns: 1fr; }
  .checkout-summary { position: static; }
}
@media (max-width: 640px) {
  .form-grid { grid-template-columns: 1fr; }
  .steps-indicator { gap: var(--space-3); }
  .step-indicator-item span { display: none; }
}
</style>
