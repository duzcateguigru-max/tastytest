import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  timeout: 15000,
})

// ─── Request interceptor: attach Bearer token ───
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── Response interceptor: handle errors ────────
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      router.push('/login')
    }
    return Promise.reject(error)
  },
)

// ─── API service methods ─────────────────────────

// Auth
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/token', { ...data, device_name: 'web' }),
  logout: () => api.delete('/token'),
  register: (data: object) => api.post('/customers', data),
  me: () => api.get('/customers/me'),
}

// Menu
export const menuApi = {
  getItems: (params?: object) => api.get('/menus', { params }),
  getItem: (id: number) => api.get(`/menus/${id}`),
  createItem: (data: object) => api.post('/menus', data),
  updateItem: (id: number, data: object) => api.put(`/menus/${id}`, data),
  deleteItem: (id: number) => api.delete(`/menus/${id}`),
}

// Categories
export const categoriesApi = {
  getAll: (params?: object) => api.get('/categories', { params }),
  getOne: (id: number) => api.get(`/categories/${id}`),
  create: (data: object) => api.post('/categories', data),
  update: (id: number, data: object) => api.put(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
}

// Orders
export const ordersApi = {
  getAll: (params?: object) => api.get('/orders', { params }),
  getOne: (id: number) => api.get(`/orders/${id}`),
  create: (data: object) => api.post('/orders', data),
  update: (id: number, data: object) => api.put(`/orders/${id}`, data),
  delete: (id: number) => api.delete(`/orders/${id}`),
}

// Customers
export const customersApi = {
  getAll: (params?: object) => api.get('/customers', { params }),
  getOne: (id: number) => api.get(`/customers/${id}`),
  update: (id: number, data: object) => api.put(`/customers/${id}`, data),
  delete: (id: number) => api.delete(`/customers/${id}`),
}

// Reservations
export const reservationsApi = {
  getAll: (params?: object) => api.get('/reservations', { params }),
  getOne: (id: number) => api.get(`/reservations/${id}`),
  create: (data: object) => api.post('/reservations', data),
  update: (id: number, data: object) => api.put(`/reservations/${id}`, data),
  delete: (id: number) => api.delete(`/reservations/${id}`),
}

// Coupons
export const couponsApi = {
  getAll: (params?: object) => api.get('/coupons', { params }),
  getOne: (id: number) => api.get(`/coupons/${id}`),
  create: (data: object) => api.post('/coupons', data),
  update: (id: number, data: object) => api.put(`/coupons/${id}`, data),
  delete: (id: number) => api.delete(`/coupons/${id}`),
  apply: (code: string) => api.post('/coupons/apply', { code }),
}

// Reviews
export const reviewsApi = {
  getAll: (params?: object) => api.get('/reviews', { params }),
  create: (data: object) => api.post('/reviews', data),
  update: (id: number, data: object) => api.put(`/reviews/${id}`, data),
  delete: (id: number) => api.delete(`/reviews/${id}`),
}

// Locations
export const locationsApi = {
  getAll: () => api.get('/locations'),
  getOne: (id: number) => api.get(`/locations/${id}`),
}

export default api
