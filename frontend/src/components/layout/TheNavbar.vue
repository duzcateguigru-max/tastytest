<template>
  <header class="navbar" :class="{ scrolled: isScrolled }">
    <div class="container navbar-inner">
      <!-- Logo -->
      <RouterLink to="/" class="navbar-logo">
        <span class="logo-emoji">🍽️</span>
        <span class="logo-name">FlavorHaven</span>
      </RouterLink>

      <!-- Desktop nav -->
      <nav class="navbar-nav">
        <RouterLink to="/" class="nav-link" :class="{ active: route.path === '/' }">Home</RouterLink>
        <RouterLink to="/menu" class="nav-link">Menu</RouterLink>
        <RouterLink to="/reservations" class="nav-link">Reservations</RouterLink>
        <RouterLink to="/reviews" class="nav-link">Reviews</RouterLink>
      </nav>

      <!-- Actions -->
      <div class="navbar-actions">
        <!-- Cart button -->
        <RouterLink to="/cart" class="cart-btn" id="cart-button">
          <ShoppingCart :size="20" />
          <Transition name="fade">
            <span class="cart-badge" v-if="cart.itemCount > 0">{{ cart.itemCount }}</span>
          </Transition>
        </RouterLink>

        <!-- Auth -->
        <template v-if="auth.isLoggedIn">
          <div class="user-menu" ref="userMenuRef">
            <button class="user-avatar-btn" @click="showUserMenu = !showUserMenu" id="user-menu-button">
              {{ auth.fullName.charAt(0) || 'U' }}
            </button>
            <Transition name="fade">
              <div class="user-dropdown" v-if="showUserMenu">
                <RouterLink to="/orders" class="dropdown-item" @click="showUserMenu = false">
                  <Package :size="15" /> My Orders
                </RouterLink>
                <RouterLink to="/profile" class="dropdown-item" @click="showUserMenu = false">
                  <User :size="15" /> Profile
                </RouterLink>
                <RouterLink to="/admin" class="dropdown-item" @click="showUserMenu = false">
                  <Settings :size="15" /> Admin Panel
                </RouterLink>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item danger" @click="handleLogout">
                  <LogOut :size="15" /> Sign Out
                </button>
              </div>
            </Transition>
          </div>
        </template>
        <template v-else>
          <RouterLink to="/login" class="btn btn-outline btn-sm">Sign In</RouterLink>
          <RouterLink to="/register" class="btn btn-primary btn-sm">Join Us</RouterLink>
        </template>

        <!-- Mobile hamburger -->
        <button class="hamburger" @click="mobileOpen = !mobileOpen" aria-label="Toggle menu">
          <Menu v-if="!mobileOpen" :size="22" />
          <X v-else :size="22" />
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition name="fade">
      <div class="mobile-menu" v-if="mobileOpen">
        <RouterLink to="/"            class="mobile-link" @click="mobileOpen = false">Home</RouterLink>
        <RouterLink to="/menu"        class="mobile-link" @click="mobileOpen = false">Menu</RouterLink>
        <RouterLink to="/reservations" class="mobile-link" @click="mobileOpen = false">Reservations</RouterLink>
        <RouterLink to="/reviews"     class="mobile-link" @click="mobileOpen = false">Reviews</RouterLink>
        <RouterLink to="/cart"        class="mobile-link" @click="mobileOpen = false">Cart ({{ cart.itemCount }})</RouterLink>
        <template v-if="auth.isLoggedIn">
          <RouterLink to="/orders"  class="mobile-link" @click="mobileOpen = false">My Orders</RouterLink>
          <RouterLink to="/profile" class="mobile-link" @click="mobileOpen = false">Profile</RouterLink>
          <RouterLink to="/admin"   class="mobile-link" @click="mobileOpen = false">Admin</RouterLink>
          <button class="mobile-link danger" @click="handleLogout">Sign Out</button>
        </template>
        <template v-else>
          <RouterLink to="/login"    class="mobile-link" @click="mobileOpen = false">Sign In</RouterLink>
          <RouterLink to="/register" class="mobile-link" @click="mobileOpen = false">Join Us</RouterLink>
        </template>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ShoppingCart, Menu, X, User, LogOut, Settings, Package } from 'lucide-vue-next'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'

const cart = useCartStore()
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const isScrolled = ref(false)
const mobileOpen = ref(false)
const showUserMenu = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)

function onScroll() { isScrolled.value = window.scrollY > 20 }
function onClickOutside(e: MouseEvent) {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target as Node)) showUserMenu.value = false
}
async function handleLogout() {
  await auth.logout()
  showUserMenu.value = false
  mobileOpen.value = false
  router.push('/')
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  document.addEventListener('click', onClickOutside)
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  document.removeEventListener('click', onClickOutside)
})
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: var(--navbar-height);
  z-index: 200;
  transition: all var(--transition-base);
  border-bottom: 1px solid transparent;
}
.navbar.scrolled {
  background: rgba(10, 10, 10, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom-color: var(--color-border);
}

.navbar-inner {
  display: flex;
  align-items: center;
  height: 100%;
  gap: var(--space-8);
}

.navbar-logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-family: var(--font-heading);
  font-size: 1.3rem;
  font-weight: 700;
}
.logo-emoji { font-size: 1.6rem; }

.navbar-nav {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  flex: 1;
}
.nav-link {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text-2);
  transition: all var(--transition-fast);
}
.nav-link:hover, .nav-link.active { color: var(--color-text); background: rgba(255,255,255,0.07); }
.nav-link.router-link-active { color: var(--color-primary); }

.navbar-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-left: auto;
}

.cart-btn {
  position: relative;
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.06);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  transition: all var(--transition-fast);
}
.cart-btn:hover { background: rgba(255,255,255,0.12); border-color: var(--color-border-hover); }
.cart-badge {
  position: absolute;
  top: -6px; right: -6px;
  background: var(--color-primary);
  color: var(--color-text-invert);
  font-size: 0.65rem;
  font-weight: 700;
  min-width: 18px; height: 18px;
  border-radius: var(--radius-full);
  display: flex; align-items: center; justify-content: center;
  padding: 0 4px;
}

.user-menu { position: relative; }
.user-avatar-btn {
  width: 38px; height: 38px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  border-radius: 50%;
  color: var(--color-text-invert);
  font-weight: 700; font-size: 0.9rem;
  cursor: pointer; border: none;
  transition: all var(--transition-fast);
}
.user-avatar-btn:hover { transform: scale(1.05); box-shadow: var(--shadow-glow); }

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px); right: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-2);
  min-width: 180px;
  box-shadow: var(--shadow-lg);
}
.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  color: var(--color-text-2);
  transition: all var(--transition-fast);
  width: 100%; border: none; background: none; cursor: pointer; text-align: left;
}
.dropdown-item:hover { color: var(--color-text); background: rgba(255,255,255,0.07); }
.dropdown-item.danger:hover { color: var(--color-secondary); }
.dropdown-divider { height: 1px; background: var(--color-border); margin: var(--space-2) 0; }

.hamburger {
  display: none;
  color: var(--color-text);
  padding: var(--space-2);
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}
.hamburger:hover { background: rgba(255,255,255,0.08); }

.mobile-menu {
  background: rgba(15,15,15,0.98);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--color-border);
  padding: var(--space-4);
  display: flex; flex-direction: column; gap: var(--space-1);
}
.mobile-link {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  font-size: 1rem;
  color: var(--color-text-2);
  transition: all var(--transition-fast);
  border: none; background: none; cursor: pointer; text-align: left; width: 100%;
}
.mobile-link:hover { color: var(--color-text); background: rgba(255,255,255,0.07); }
.mobile-link.danger:hover { color: var(--color-secondary); }

@media (max-width: 768px) {
  .navbar-nav { display: none; }
  .hamburger { display: flex; align-items: center; justify-content: center; }
  .btn { display: none; }
  .cart-btn { display: flex; }
}
</style>
