<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="admin-sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <div class="sidebar-logo" v-if="!sidebarCollapsed">
          <span class="logo-icon">🍽️</span>
          <span class="logo-text">FlavorHaven</span>
        </div>
        <button class="btn btn-ghost btn-icon collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed">
          <PanelLeftClose v-if="!sidebarCollapsed" :size="18" />
          <PanelLeftOpen v-else :size="18" />
        </button>
      </div>

      <nav class="sidebar-nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          :class="{ active: isActive(item.to) }"
        >
          <component :is="item.icon" :size="20" />
          <span v-if="!sidebarCollapsed" class="nav-label">{{ item.label }}</span>
          <span v-if="!sidebarCollapsed && item.badge" class="nav-badge">{{ item.badge }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer" v-if="!sidebarCollapsed">
        <RouterLink to="/" class="back-to-site">
          <ExternalLink :size="16" />
          Ver Sitio
        </RouterLink>
        <button class="btn btn-ghost btn-sm w-full" @click="auth.logout(); router.push('/login')">
          <LogOut :size="16" /> Cerrar Sesión
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="admin-content" :class="{ expanded: sidebarCollapsed }">
      <!-- Top bar -->
      <header class="admin-topbar">
        <div class="topbar-left">
          <h2 class="page-title">{{ currentPageTitle }}</h2>
        </div>
        <div class="topbar-right">
          <div class="admin-user">
            <div class="user-avatar">{{ auth.fullName.charAt(0) || 'A' }}</div>
            <span class="user-name">{{ auth.fullName || 'Admin' }}</span>
          </div>
        </div>
      </header>

      <main class="admin-main">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed, Tag, Users,
  CalendarDays, Ticket, Star, Settings, LogOut, ExternalLink,
  PanelLeftClose, PanelLeftOpen
} from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const sidebarCollapsed = ref(false)

const navItems: { to: string; label: string; icon: any; badge?: string }[] = [
  { to: '/admin',              label: 'Tablero',       icon: LayoutDashboard },
  { to: '/admin/orders',       label: 'Pedidos',       icon: ShoppingBag },
  { to: '/admin/menu',         label: 'Menú',          icon: UtensilsCrossed },
  { to: '/admin/categories',   label: 'Categorías',   icon: Tag },
  { to: '/admin/customers',    label: 'Clientes',      icon: Users },
  { to: '/admin/reservations', label: 'Reservas',      icon: CalendarDays },
  { to: '/admin/coupons',      label: 'Cupones',       icon: Ticket },
  { to: '/admin/reviews',      label: 'Reseñas',       icon: Star },
  { to: '/admin/settings',     label: 'Configuración', icon: Settings },
]

function isActive(to: string) {
  if (to === '/admin') return route.path === '/admin'
  return route.path.startsWith(to)
}

const currentPageTitle = computed(() => {
  const item = navItems.find((i) => isActive(i.to))
  return item?.label ?? 'Admin'
})
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: var(--color-bg);
}

/* ── Sidebar ─────────────────────────── */
.admin-sidebar {
  width: var(--sidebar-width);
  background: var(--color-bg-2);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0; left: 0;
  height: 100vh;
  z-index: 100;
  transition: width var(--transition-base);
  overflow: hidden;
}
.admin-sidebar.collapsed { width: 72px; }

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  height: var(--navbar-height);
  gap: var(--space-3);
}
.sidebar-logo { display: flex; align-items: center; gap: var(--space-3); flex: 1; min-width: 0; }
.logo-icon { font-size: 1.5rem; flex-shrink: 0; }
.logo-text { font-family: var(--font-heading); font-size: 1.1rem; font-weight: 700; white-space: nowrap; }
.collapse-btn { flex-shrink: 0; }

.sidebar-nav {
  flex: 1;
  padding: var(--space-4) var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-3);
  border-radius: var(--radius-md);
  color: var(--color-text-2);
  font-size: 0.9rem;
  font-weight: 500;
  transition: all var(--transition-fast);
  white-space: nowrap;
  position: relative;
}
.nav-item:hover { color: var(--color-text); background: rgba(255,255,255,0.06); }
.nav-item.active { color: var(--color-primary); background: var(--color-primary-dim); }
.nav-label { flex: 1; }
.nav-badge {
  background: var(--color-secondary);
  color: white;
  font-size: 0.7rem;
  padding: 0.1em 0.5em;
  border-radius: var(--radius-full);
}

.sidebar-footer {
  padding: var(--space-4);
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.back-to-site {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.85rem;
  color: var(--color-text-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}
.back-to-site:hover { color: var(--color-text); background: rgba(255,255,255,0.06); }

/* ── Content ─────────────────────────── */
.admin-content {
  flex: 1;
  margin-left: var(--sidebar-width);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left var(--transition-base);
}
.admin-content.expanded { margin-left: 72px; }

.admin-topbar {
  height: var(--navbar-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-inline: var(--space-8);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-2);
  position: sticky; top: 0; z-index: 50;
}
.page-title { font-size: 1.25rem; font-weight: 600; font-family: var(--font-heading); }
.topbar-right { display: flex; align-items: center; gap: var(--space-4); }
.admin-user { display: flex; align-items: center; gap: var(--space-3); }
.user-avatar {
  width: 36px; height: 36px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 0.9rem; color: var(--color-text-invert);
}
.user-name { font-size: 0.9rem; font-weight: 500; }

.admin-main { flex: 1; padding: var(--space-8); }

@media (max-width: 768px) {
  .admin-sidebar { transform: translateX(-100%); }
  .admin-content { margin-left: 0; }
  .admin-main { padding: var(--space-4); }
  .admin-topbar { padding-inline: var(--space-4); }
}
</style>
