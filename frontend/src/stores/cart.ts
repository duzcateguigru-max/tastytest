import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { couponsApi } from '@/services/api'
import { useToast } from 'vue-toastification'

export interface CartItem {
  id: number
  menu_id: number
  name: string
  price: number
  quantity: number
  image?: string
  options?: Record<string, string>
}

export interface Coupon {
  code: string
  discount: number
  type: 'fixed' | 'percent'
}

export const useCartStore = defineStore('cart', () => {
  const toast = useToast()
  const items = ref<CartItem[]>([])
  const coupon = ref<Coupon | null>(null)
  const loading = ref(false)

  const itemCount = computed(() => items.value.reduce((s, i) => s + i.quantity, 0))
  const subtotal = computed(() => items.value.reduce((s, i) => s + i.price * i.quantity, 0))
  const discount = computed(() => {
    if (!coupon.value) return 0
    return coupon.value.type === 'percent'
      ? subtotal.value * (coupon.value.discount / 100)
      : coupon.value.discount
  })
  const deliveryFee = computed(() => (subtotal.value >= 30 ? 0 : 3.99))
  const total = computed(() => Math.max(0, subtotal.value - discount.value + deliveryFee.value))

  function addItem(item: Omit<CartItem, 'quantity'>, qty = 1) {
    const existing = items.value.find((i) => i.menu_id === item.menu_id)
    if (existing) {
      existing.quantity += qty
    } else {
      items.value.push({ ...item, quantity: qty })
    }
    toast.success(`${item.name} added to cart!`)
  }

  function removeItem(menuId: number) {
    items.value = items.value.filter((i) => i.menu_id !== menuId)
  }

  function updateQuantity(menuId: number, qty: number) {
    const item = items.value.find((i) => i.menu_id === menuId)
    if (item) {
      if (qty <= 0) removeItem(menuId)
      else item.quantity = qty
    }
  }

  function clearCart() {
    items.value = []
    coupon.value = null
  }

  async function applyCoupon(code: string) {
    loading.value = true
    try {
      const res = await couponsApi.apply(code)
      coupon.value = res.data
      toast.success('Coupon applied!')
    } catch {
      toast.error('Invalid or expired coupon')
    } finally {
      loading.value = false
    }
  }

  function removeCoupon() {
    coupon.value = null
  }

  return {
    items, coupon, loading,
    itemCount, subtotal, discount, deliveryFee, total,
    addItem, removeItem, updateQuantity, clearCart, applyCoupon, removeCoupon,
  }
}, { persist: true })
