import { supabase } from '@/lib/supabase'

// ─── Helper: throw on Supabase error ─────────────────
function check<T>(data: T | null, error: unknown): T {
  if (error) throw error
  return data as T
}

// ─── Auth ─────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),
  logout: () => supabase.auth.signOut(),
  register: (email: string, password: string, meta?: object) =>
    supabase.auth.signUp({ email, password, options: { data: meta } }),
  me: () => supabase.auth.getUser(),
}

// ─── Menu Items ───────────────────────────────────────
export const menuApi = {
  getItems: async (params?: { page_limit?: number; [key: string]: unknown }) => {
    let query = supabase.from('menu_items').select('*').order('id', { ascending: false })
    if (params?.page_limit) query = query.limit(params.page_limit)
    const { data, error } = await query
    check(data, error)
    return { data: { data } }
  },
  getItem: async (id: number) => {
    const { data, error } = await supabase.from('menu_items').select('*').eq('id', id).single()
    check(data, error)
    return { data: { data } }
  },
  createItem: async (payload: object) => {
    const { data, error } = await supabase.from('menu_items').insert([payload]).select().single()
    check(data, error)
    return { data: { data } }
  },
  updateItem: async (id: number, payload: object) => {
    const { data, error } = await supabase.from('menu_items').update(payload).eq('id', id).select().single()
    check(data, error)
    return { data: { data } }
  },
  deleteItem: async (id: number) => {
    const { error } = await supabase.from('menu_items').delete().eq('id', id)
    if (error) throw error
    return { data: {} }
  },
}

// ─── Categories ───────────────────────────────────────
export const categoriesApi = {
  getAll: async (params?: { page_limit?: number }) => {
    let query = supabase.from('categories').select('*').order('id', { ascending: true })
    if (params?.page_limit) query = query.limit(params.page_limit)
    const { data, error } = await query
    check(data, error)
    return { data: { data } }
  },
  getOne: async (id: number) => {
    const { data, error } = await supabase.from('categories').select('*').eq('id', id).single()
    check(data, error)
    return { data: { data } }
  },
  create: async (payload: object) => {
    const { data, error } = await supabase.from('categories').insert([payload]).select().single()
    check(data, error)
    return { data: { data } }
  },
  update: async (id: number, payload: object) => {
    const { data, error } = await supabase.from('categories').update(payload).eq('id', id).select().single()
    check(data, error)
    return { data: { data } }
  },
  delete: async (id: number) => {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
    return { data: {} }
  },
}

// ─── Orders ───────────────────────────────────────────
export const ordersApi = {
  getAll: async (params?: { page_limit?: number }) => {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (params?.page_limit) query = query.limit(params.page_limit)
    const { data, error } = await query
    check(data, error)
    return { data: { data } }
  },
  getOne: async (id: number) => {
    const { data, error } = await supabase.from('orders').select('*, order_items(*)').eq('id', id).single()
    check(data, error)
    return { data: { data } }
  },
  create: async (payload: object) => {
    const { data, error } = await supabase.from('orders').insert([payload]).select().single()
    check(data, error)
    return { data: { data } }
  },
  update: async (id: number, payload: object) => {
    const { data, error } = await supabase.from('orders').update(payload).eq('id', id).select().single()
    check(data, error)
    return { data: { data } }
  },
  delete: async (id: number) => {
    const { error } = await supabase.from('orders').delete().eq('id', id)
    if (error) throw error
    return { data: {} }
  },
}

// ─── Customers ────────────────────────────────────────
export const customersApi = {
  getAll: async (params?: { page_limit?: number }) => {
    let query = supabase.from('customers').select('*').order('created_at', { ascending: false })
    if (params?.page_limit) query = query.limit(params.page_limit)
    const { data, error } = await query
    check(data, error)
    return { data: { data } }
  },
  getOne: async (id: number) => {
    const { data, error } = await supabase.from('customers').select('*').eq('id', id).single()
    check(data, error)
    return { data: { data } }
  },
  update: async (id: number, payload: object) => {
    const { data, error } = await supabase.from('customers').update(payload).eq('id', id).select().single()
    check(data, error)
    return { data: { data } }
  },
  delete: async (id: number) => {
    const { error } = await supabase.from('customers').delete().eq('id', id)
    if (error) throw error
    return { data: {} }
  },
}

// ─── Reservations ─────────────────────────────────────
export const reservationsApi = {
  getAll: async (params?: { page_limit?: number }) => {
    let query = supabase.from('reservations').select('*').order('reservation_date', { ascending: false })
    if (params?.page_limit) query = query.limit(params.page_limit)
    const { data, error } = await query
    check(data, error)
    return { data: { data } }
  },
  getOne: async (id: number) => {
    const { data, error } = await supabase.from('reservations').select('*').eq('id', id).single()
    check(data, error)
    return { data: { data } }
  },
  create: async (payload: object) => {
    const { data, error } = await supabase.from('reservations').insert([payload]).select().single()
    check(data, error)
    return { data: { data } }
  },
  update: async (id: number, payload: object) => {
    const { data, error } = await supabase.from('reservations').update(payload).eq('id', id).select().single()
    check(data, error)
    return { data: { data } }
  },
  delete: async (id: number) => {
    const { error } = await supabase.from('reservations').delete().eq('id', id)
    if (error) throw error
    return { data: {} }
  },
}

// ─── Coupons ──────────────────────────────────────────
export const couponsApi = {
  getAll: async (params?: { page_limit?: number }) => {
    let query = supabase.from('coupons').select('*').order('id', { ascending: false })
    if (params?.page_limit) query = query.limit(params.page_limit)
    const { data, error } = await query
    check(data, error)
    return { data: { data } }
  },
  getOne: async (id: number) => {
    const { data, error } = await supabase.from('coupons').select('*').eq('id', id).single()
    check(data, error)
    return { data: { data } }
  },
  create: async (payload: object) => {
    const { data, error } = await supabase.from('coupons').insert([payload]).select().single()
    check(data, error)
    return { data: { data } }
  },
  update: async (id: number, payload: object) => {
    const { data, error } = await supabase.from('coupons').update(payload).eq('id', id).select().single()
    check(data, error)
    return { data: { data } }
  },
  delete: async (id: number) => {
    const { error } = await supabase.from('coupons').delete().eq('id', id)
    if (error) throw error
    return { data: {} }
  },
  apply: async (code: string) => {
    const { data, error } = await supabase.from('coupons').select('*').eq('code', code).eq('is_active', true).single()
    check(data, error)
    return { data: { data } }
  },
}

// ─── Reviews ──────────────────────────────────────────
export const reviewsApi = {
  getAll: async (params?: { page_limit?: number }) => {
    let query = supabase.from('reviews').select('*').order('created_at', { ascending: false })
    if (params?.page_limit) query = query.limit(params.page_limit)
    const { data, error } = await query
    check(data, error)
    return { data: { data } }
  },
  create: async (payload: object) => {
    const { data, error } = await supabase.from('reviews').insert([payload]).select().single()
    check(data, error)
    return { data: { data } }
  },
  update: async (id: number, payload: object) => {
    const { data, error } = await supabase.from('reviews').update(payload).eq('id', id).select().single()
    check(data, error)
    return { data: { data } }
  },
  delete: async (id: number) => {
    const { error } = await supabase.from('reviews').delete().eq('id', id)
    if (error) throw error
    return { data: {} }
  },
}

// ─── Locations (read-only reference data) ────────────
export const locationsApi = {
  getAll: async () => {
    const { data, error } = await supabase.from('locations').select('*')
    check(data, error)
    return { data: { data } }
  },
  getOne: async (id: number) => {
    const { data, error } = await supabase.from('locations').select('*').eq('id', id).single()
    check(data, error)
    return { data: { data } }
  },
}

export default supabase
