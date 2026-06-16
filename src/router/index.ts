import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0, behavior: 'smooth' }),
  routes: [
    // ── Storefront layout ──────────────────────
    {
      path: '/',
      component: () => import('@/layouts/StorefrontLayout.vue'),
      children: [
        { path: '',          name: 'home',         component: () => import('@/views/storefront/HomePage.vue') },
        { path: 'menu',      name: 'menu',         component: () => import('@/views/storefront/MenuPage.vue') },
        { path: 'menu/:id',  name: 'menu-item',    component: () => import('@/views/storefront/MenuItemPage.vue') },
        { path: 'cart',      name: 'cart',         component: () => import('@/views/storefront/CartPage.vue') },
        { path: 'reservations', name: 'reservations', component: () => import('@/views/storefront/ReservationsPage.vue') },
        { path: 'reviews',   name: 'reviews',      component: () => import('@/views/storefront/ReviewsPage.vue') },
        {
          path: 'checkout',  name: 'checkout',
          component: () => import('@/views/storefront/CheckoutPage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'orders',    name: 'orders',
          component: () => import('@/views/storefront/OrdersPage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'orders/:id', name: 'order-tracking',
          component: () => import('@/views/storefront/OrderTrackingPage.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'profile',   name: 'profile',
          component: () => import('@/views/storefront/ProfilePage.vue'),
          meta: { requiresAuth: true },
        },
      ],
    },

    // ── Auth pages ─────────────────────────────
    {
      path: '/login',    name: 'login',    component: () => import('@/views/auth/LoginPage.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/register', name: 'register', component: () => import('@/views/auth/RegisterPage.vue'),
      meta: { guestOnly: true },
    },

    // ── Admin layout ───────────────────────────
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '',                name: 'admin-dashboard',     component: () => import('@/views/admin/DashboardPage.vue') },
        { path: 'orders',          name: 'admin-orders',        component: () => import('@/views/admin/OrdersPage.vue') },
        { path: 'orders/:id',      name: 'admin-order-detail',  component: () => import('@/views/admin/OrderDetailPage.vue') },
        { path: 'menu',            name: 'admin-menu',          component: () => import('@/views/admin/MenuPage.vue') },
        { path: 'categories',      name: 'admin-categories',    component: () => import('@/views/admin/CategoriesPage.vue') },
        { path: 'customers',       name: 'admin-customers',     component: () => import('@/views/admin/CustomersPage.vue') },
        { path: 'reservations',    name: 'admin-reservations',  component: () => import('@/views/admin/ReservationsPage.vue') },
        { path: 'coupons',         name: 'admin-coupons',       component: () => import('@/views/admin/CouponsPage.vue') },
        { path: 'reviews',         name: 'admin-reviews',       component: () => import('@/views/admin/ReviewsPage.vue') },
        { path: 'settings',        name: 'admin-settings',      component: () => import('@/views/admin/SettingsPage.vue') },
      ],
    },

    // ── 404 ────────────────────────────────────
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFoundPage.vue') },
  ],
})

// Navigation guards
router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) return next('/login')
  if (to.meta.guestOnly && auth.isLoggedIn) return next('/')
  next()
})

export default router
