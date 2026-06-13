import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ordersApi, customersApi, menuApi, reviewsApi } from '@/services/api'

export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  pendingOrders: number
  revenueByDay: { date: string; revenue: number }[]
  ordersByStatus: { status: string; count: number }[]
}

export const useAdminStore = defineStore('admin', () => {
  const stats = ref<DashboardStats | null>(null)
  const loading = ref(false)

  async function fetchStats() {
    loading.value = true
    try {
      // Fetch all data in parallel for dashboard KPIs
      const [ordersRes, customersRes] = await Promise.all([
        ordersApi.getAll({ page_limit: 500 }),
        customersApi.getAll({ page_limit: 1 }),
      ])
      const orders = ordersRes.data.data ?? ordersRes.data
      const totalCustomers = customersRes.data.pagination?.total ?? customersRes.data.length ?? 0
      const totalRevenue = orders.reduce((s: number, o: any) => s + Number(o.order_total ?? 0), 0)
      const pendingOrders = orders.filter((o: any) => o.status_id === 1).length

      // Revenue by day (last 7 days)
      const dayMap: Record<string, number> = {}
      orders.forEach((o: any) => {
        const day = o.created_at?.substring(0, 10)
        if (day) dayMap[day] = (dayMap[day] ?? 0) + Number(o.order_total ?? 0)
      })
      const revenueByDay = Object.entries(dayMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-7)
        .map(([date, revenue]) => ({ date, revenue }))

      // Orders by status
      const statusMap: Record<string, number> = {}
      orders.forEach((o: any) => {
        const s = o.status_name ?? `Status ${o.status_id}`
        statusMap[s] = (statusMap[s] ?? 0) + 1
      })
      const ordersByStatus = Object.entries(statusMap).map(([status, count]) => ({ status, count }))

      stats.value = {
        totalOrders: orders.length,
        totalRevenue,
        totalCustomers,
        pendingOrders,
        revenueByDay,
        ordersByStatus,
      }
    } finally {
      loading.value = false
    }
  }

  return { stats, loading, fetchStats }
})
