import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ordersApi } from '@/services/api'
import { useCartStore } from './cart'

export interface Order {
  id: number
  order_id: string
  customer_name: string
  order_total: number
  order_type: 'delivery' | 'collection'
  status_id: number
  status_name?: string
  created_at: string
  order_menus?: OrderMenu[]
  location?: { location_name: string }
}

export interface OrderMenu {
  id: number
  name: string
  quantity: number
  price: number
}

export const ORDER_STATUSES: Record<number, { label: string; color: string }> = {
  1:  { label: 'Pendiente',    color: '#fbbf24' },
  2:  { label: 'Procesando',  color: '#3b82f6' },
  3:  { label: 'Preparando',  color: '#8b5cf6' },
  4:  { label: 'En Camino',   color: '#f59e0b' },
  5:  { label: 'Entregado',   color: '#10b981' },
  6:  { label: 'Cancelado',   color: '#ef4444' },
  99: { label: 'Completado',  color: '#10b981' },
}

export const useOrdersStore = defineStore('orders', () => {
  const orders = ref<Order[]>([])
  const currentOrder = ref<Order | null>(null)
  const loading = ref(false)
  const pollingInterval = ref<ReturnType<typeof setInterval> | null>(null)

  async function fetchOrders(params?: object) {
    loading.value = true
    try {
      const res = await ordersApi.getAll(params)
      orders.value = res.data.data ?? res.data
    } finally {
      loading.value = false
    }
  }

  async function fetchOrder(id: number) {
    loading.value = true
    try {
      const res = await ordersApi.getOne(id)
      currentOrder.value = res.data.data ?? res.data
    } finally {
      loading.value = false
    }
  }

  async function placeOrder(data: object) {
    loading.value = true
    try {
      const cart = useCartStore()
      const payload = {
        ...data,
        order_menus: cart.items.map((i) => ({
          menu_id: i.menu_id,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
        order_total: cart.total,
      }
      const res = await ordersApi.create(payload)
      const order = res.data.data ?? res.data
      orders.value.unshift(order)
      cart.clearCart()
      return order
    } finally {
      loading.value = false
    }
  }

  async function updateStatus(id: number, status_id: number) {
    const res = await ordersApi.update(id, { status_id })
    const idx = orders.value.findIndex((o) => o.id === id)
    if (idx !== -1) orders.value[idx] = res.data.data ?? res.data
    if (currentOrder.value?.id === id) currentOrder.value = res.data.data ?? res.data
  }

  function startPolling(orderId: number) {
    stopPolling()
    pollingInterval.value = setInterval(() => fetchOrder(orderId), 10000)
  }

  function stopPolling() {
    if (pollingInterval.value) { clearInterval(pollingInterval.value); pollingInterval.value = null }
  }

  return {
    orders, currentOrder, loading,
    fetchOrders, fetchOrder, placeOrder, updateStatus, startPolling, stopPolling,
  }
})
