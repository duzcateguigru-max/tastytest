import { defineStore } from 'pinia'
import { ref } from 'vue'
import { menuApi, categoriesApi } from '@/services/api'

export interface MenuItem {
  id: number
  menu_name: string
  menu_description: string
  menu_price: number
  menu_photo?: string
  menu_category_id: number
  menu_status: boolean
}

export interface Category {
  id: number
  name: string
  description?: string
  img?: string
}

export const useMenuStore = defineStore('menu', () => {
  const items = ref<MenuItem[]>([])
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const selectedCategory = ref<number | null>(null)
  const search = ref('')

  async function fetchCategories() {
    const res = await categoriesApi.getAll({ page_limit: 100 })
    categories.value = res.data.data ?? res.data
  }

  async function fetchItems(params?: object) {
    loading.value = true
    try {
      const res = await menuApi.getItems({ page_limit: 100, ...params })
      items.value = res.data.data ?? res.data
    } finally {
      loading.value = false
    }
  }

  async function createItem(data: object) {
    const res = await menuApi.createItem(data)
    items.value.push(res.data.data ?? res.data)
    return res.data
  }

  async function updateItem(id: number, data: object) {
    const res = await menuApi.updateItem(id, data)
    const idx = items.value.findIndex((i) => i.id === id)
    if (idx !== -1) items.value[idx] = res.data.data ?? res.data
  }

  async function deleteItem(id: number) {
    await menuApi.deleteItem(id)
    items.value = items.value.filter((i) => i.id !== id)
  }

  return {
    items, categories, loading, selectedCategory, search,
    fetchCategories, fetchItems, createItem, updateItem, deleteItem,
  }
})
