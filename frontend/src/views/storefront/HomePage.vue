<template>
  <div class="home-page">
    <!-- ── Hero ──────────────────────────────── -->
    <section class="hero">
      <div class="hero-bg">
        <div class="hero-gradient"></div>
        <div class="hero-particles">
          <div v-for="n in 20" :key="n" class="particle" :style="particleStyle(n)"></div>
        </div>
      </div>
      <div class="container hero-content">
        <div class="hero-text">
          <span class="hero-eyebrow">✦ Premium Dining Experience</span>
          <h1>
            Crafted with<br />
            <span class="text-gradient">Passion & Flavor</span>
          </h1>
          <p>Discover exceptional cuisine made from the finest ingredients. Order online for delivery or reserve your table for an unforgettable evening.</p>
          <div class="hero-actions">
            <RouterLink to="/menu" class="btn btn-primary btn-lg" id="hero-order-btn">
              <UtensilsCrossed :size="18" /> Order Now
            </RouterLink>
            <RouterLink to="/reservations" class="btn btn-ghost btn-lg" id="hero-reserve-btn">
              <CalendarDays :size="18" /> Book a Table
            </RouterLink>
          </div>
          <div class="hero-stats">
            <div class="stat">
              <span class="stat-value">500+</span>
              <span class="stat-label">Menu Items</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-value">4.9★</span>
              <span class="stat-label">Rating</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-value">20k+</span>
              <span class="stat-label">Happy Guests</span>
            </div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-dish-card animate-float">
            <div class="dish-emoji">🥩</div>
            <div class="dish-info">
              <span class="dish-name">Wagyu Ribeye</span>
              <span class="dish-price">$48</span>
            </div>
          </div>
          <div class="hero-dish-card card-2 animate-float" style="animation-delay: 0.5s">
            <div class="dish-emoji">🦞</div>
            <div class="dish-info">
              <span class="dish-name">Lobster Bisque</span>
              <span class="dish-price">$34</span>
            </div>
          </div>
          <div class="hero-dish-card card-3 animate-float" style="animation-delay: 1s">
            <div class="dish-emoji">🍰</div>
            <div class="dish-info">
              <span class="dish-name">Lemon Tart</span>
              <span class="dish-price">$14</span>
            </div>
          </div>
          <div class="big-food-icon">🍽️</div>
        </div>
      </div>
    </section>

    <!-- ── Features ───────────────────────────── -->
    <section class="section-sm features-section">
      <div class="container">
        <div class="features-row">
          <div class="feature-item glass-card" v-for="f in features" :key="f.icon">
            <div class="feature-icon">{{ f.icon }}</div>
            <div>
              <h4>{{ f.title }}</h4>
              <p class="text-sm">{{ f.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Featured Menu ───────────────────────── -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <span class="eyebrow">Our Specialties</span>
          <h2>Featured <span class="text-gradient">Dishes</span></h2>
          <p>Hand-picked favorites crafted by our award-winning chefs using seasonal ingredients.</p>
        </div>

        <div v-if="menuStore.loading" class="menu-grid">
          <div v-for="n in 8" :key="n" class="menu-card-skeleton">
            <div class="skeleton" style="height:200px; border-radius: var(--radius-xl) var(--radius-xl) 0 0;"></div>
            <div style="padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-3);">
              <div class="skeleton" style="height:20px; width:70%;"></div>
              <div class="skeleton" style="height:14px; width:100%;"></div>
              <div class="skeleton" style="height:36px;"></div>
            </div>
          </div>
        </div>

        <div v-else class="menu-grid">
          <div
            v-for="item in featuredItems"
            :key="item.id"
            class="menu-card glass-card"
            @click="router.push(`/menu/${item.id}`)"
            style="cursor: pointer;"
          >
            <div class="menu-card-image">
              <div class="food-emoji-placeholder">{{ getFoodEmoji(item.menu_name) }}</div>
            </div>
            <div class="menu-card-body">
              <h4 class="menu-card-name">{{ item.menu_name }}</h4>
              <p class="menu-card-desc">{{ item.menu_description || 'A delicious creation from our kitchen.' }}</p>
              <div class="menu-card-footer">
                <span class="menu-price">${{ Number(item.menu_price).toFixed(2) }}</span>
                <button class="btn btn-primary btn-sm" @click.stop="addToCart(item)" :id="`add-cart-${item.id}`">
                  <Plus :size="14" /> Add
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center" style="margin-top: var(--space-10);">
          <RouterLink to="/menu" class="btn btn-outline btn-lg">View Full Menu →</RouterLink>
        </div>
      </div>
    </section>

    <!-- ── How It Works ────────────────────────── -->
    <section class="section how-section">
      <div class="container">
        <div class="section-header">
          <span class="eyebrow">Simple & Fast</span>
          <h2>How It <span class="text-gradient">Works</span></h2>
        </div>
        <div class="steps-row">
          <div class="step" v-for="(step, i) in steps" :key="i">
            <div class="step-number">{{ i + 1 }}</div>
            <div class="step-icon">{{ step.icon }}</div>
            <h4>{{ step.title }}</h4>
            <p class="text-sm">{{ step.desc }}</p>
          </div>
          <div class="step-connector" v-for="n in 2" :key="n"></div>
        </div>
      </div>
    </section>

    <!-- ── CTA ─────────────────────────────────── -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-card glass-card">
          <div class="cta-content">
            <span class="eyebrow" style="margin-bottom: var(--space-4);">Reserve Tonight</span>
            <h2>Book Your <span class="text-gradient">Table</span></h2>
            <p>Join us for an unforgettable dining experience. Special events, private dining, and celebrations welcome.</p>
            <RouterLink to="/reservations" class="btn btn-primary btn-lg" id="cta-reserve-btn">
              <CalendarDays :size="18" /> Make a Reservation
            </RouterLink>
          </div>
          <div class="cta-decoration">
            <div class="cta-emoji">🥂</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { UtensilsCrossed, CalendarDays, Plus } from 'lucide-vue-next'
import { useMenuStore } from '@/stores/menu'
import { useCartStore } from '@/stores/cart'

const menuStore = useMenuStore()
const cart = useCartStore()
const router = useRouter()

const featuredItems = computed(() => menuStore.items.slice(0, 8))

const features = [
  { icon: '⚡', title: 'Fast Delivery', desc: '30-minute delivery guarantee' },
  { icon: '👨‍🍳', title: 'Expert Chefs', desc: 'Award-winning culinary team' },
  { icon: '🌿', title: 'Fresh Ingredients', desc: 'Locally sourced, daily fresh' },
  { icon: '🔒', title: 'Secure Payment', desc: 'Encrypted & safe checkout' },
]

const steps = [
  { icon: '🍽️', title: 'Browse Menu', desc: 'Explore our curated selection of gourmet dishes' },
  { icon: '🛒', title: 'Add to Cart', desc: 'Select items and customize your order' },
  { icon: '🚀', title: 'Fast Delivery', desc: 'Receive your order fresh and hot' },
]

function particleStyle(n: number) {
  return {
    left: `${(n * 37) % 100}%`,
    top: `${(n * 53) % 100}%`,
    animationDelay: `${(n * 0.3) % 3}s`,
    animationDuration: `${3 + (n % 4)}s`,
    width: `${2 + (n % 3)}px`,
    height: `${2 + (n % 3)}px`,
    opacity: 0.1 + (n % 5) * 0.05,
  }
}

const emojiMap: Record<string, string> = {
  steak: '🥩', burger: '🍔', pizza: '🍕', pasta: '🍝', salad: '🥗',
  soup: '🍜', chicken: '🍗', fish: '🐟', sushi: '🍣', dessert: '🍰',
  cake: '🎂', ice: '🍦', coffee: '☕', cocktail: '🍹', wine: '🍷',
  lobster: '🦞', shrimp: '🍤', salmon: '🐠', taco: '🌮', wrap: '🌯',
}
function getFoodEmoji(name: string): string {
  const lower = name.toLowerCase()
  return Object.entries(emojiMap).find(([k]) => lower.includes(k))?.[1] ?? '🍽️'
}

function addToCart(item: any) {
  cart.addItem({
    id: item.id,
    menu_id: item.id,
    name: item.menu_name,
    price: Number(item.menu_price),
    image: item.menu_photo,
  })
}

onMounted(async () => {
  if (!menuStore.items.length) {
    await Promise.all([menuStore.fetchItems(), menuStore.fetchCategories()])
  }
})
</script>

<style scoped>
/* ── Hero ─────────────────────────────────────── */
.hero {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
}
.hero-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 80% 60% at 60% 40%, rgba(245,158,11,0.08) 0%, transparent 60%),
              radial-gradient(ellipse 60% 40% at 20% 80%, rgba(239,68,68,0.05) 0%, transparent 50%),
              var(--color-bg);
}
.hero-gradient {
  position: absolute; inset: 0;
  background: linear-gradient(to right, var(--color-bg) 40%, transparent 80%);
}
.particle {
  position: absolute;
  background: var(--color-primary);
  border-radius: 50%;
  animation: float var(--dur, 4s) ease-in-out infinite;
}

.hero-content {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-16);
  align-items: center;
  padding-block: var(--space-20);
}
.hero-text { display: flex; flex-direction: column; gap: var(--space-6); }
.hero-eyebrow {
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-primary);
}
.hero-text h1 { line-height: 1.1; }
.hero-text p { font-size: 1.1rem; max-width: 440px; }
.hero-actions { display: flex; gap: var(--space-4); flex-wrap: wrap; }

.hero-stats {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  padding-top: var(--space-4);
}
.stat { display: flex; flex-direction: column; gap: 2px; }
.stat-value { font-size: 1.5rem; font-weight: 700; font-family: var(--font-heading); color: var(--color-text); }
.stat-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--color-text-3); }
.stat-divider { width: 1px; height: 40px; background: var(--color-border); }

.hero-visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 420px;
}
.big-food-icon {
  font-size: 12rem;
  opacity: 0.06;
  position: absolute;
  user-select: none;
}
.hero-dish-card {
  position: absolute;
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(16px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  box-shadow: var(--shadow-md);
}
.hero-dish-card:nth-child(1) { top: 10%;  right: 10%; }
.hero-dish-card.card-2      { top: 45%;  left: 0; }
.hero-dish-card.card-3      { bottom: 8%; right: 15%; }
.dish-emoji { font-size: 2rem; }
.dish-info { display: flex; flex-direction: column; }
.dish-name  { font-size: 0.85rem; font-weight: 600; color: var(--color-text); }
.dish-price { font-size: 1rem; font-weight: 700; color: var(--color-primary); }

/* ── Features ──────────────────────────────────── */
.features-section { border-top: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border); background: var(--color-bg-2); }
.features-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}
.feature-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-5);
}
.feature-icon { font-size: 2rem; flex-shrink: 0; }
.feature-item h4 { margin-bottom: var(--space-1); font-size: 1rem; font-family: var(--font-body); }

/* ── Menu grid ─────────────────────────────────── */
.menu-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-5);
}
.menu-card { overflow: hidden; cursor: pointer; }
.menu-card-skeleton { border-radius: var(--radius-xl); overflow: hidden; background: var(--color-surface); }
.menu-card-image {
  height: 180px;
  background: linear-gradient(135deg, var(--color-surface), var(--color-surface-2));
  display: flex; align-items: center; justify-content: center;
}
.food-emoji-placeholder { font-size: 4rem; }
.menu-card-body { padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-3); }
.menu-card-name { font-size: 1rem; color: var(--color-text); font-family: var(--font-body); font-weight: 600; }
.menu-card-desc { font-size: 0.8rem; color: var(--color-text-3); line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.menu-card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; }
.menu-price { font-size: 1.1rem; font-weight: 700; color: var(--color-primary); }

/* ── How it works ──────────────────────────────── */
.how-section { background: var(--color-bg-2); border-top: 1px solid var(--color-border); }
.steps-row {
  display: flex;
  align-items: flex-start;
  gap: 0;
  position: relative;
  max-width: 800px;
  margin-inline: auto;
}
.step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-3);
  position: relative;
  padding: var(--space-6) var(--space-4);
}
.step-number {
  position: absolute;
  top: 0; left: 50%;
  transform: translate(-50%, -50%);
  width: 28px; height: 28px;
  background: var(--color-primary);
  color: var(--color-text-invert);
  border-radius: 50%;
  font-size: 0.8rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.step-icon { font-size: 3rem; }
.step h4 { font-family: var(--font-body); font-size: 1rem; }
.step-connector {
  width: 80px; height: 1px;
  background: linear-gradient(90deg, var(--color-border), var(--color-primary), var(--color-border));
  flex-shrink: 0;
  margin-top: var(--space-12);
}

/* ── CTA ───────────────────────────────────────── */
.cta-section { padding-block: var(--space-16); }
.cta-card {
  padding: var(--space-12) var(--space-12);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, rgba(245,158,11,0.08), rgba(239,68,68,0.05));
  border-color: rgba(245,158,11,0.2);
}
.cta-content { display: flex; flex-direction: column; gap: var(--space-5); max-width: 500px; }
.cta-content .eyebrow { display: block; }
.cta-decoration .cta-emoji { font-size: 8rem; opacity: 0.5; }

/* ── Responsive ─────────────────────────────────── */
@media (max-width: 1024px) {
  .features-row { grid-template-columns: repeat(2, 1fr); }
  .menu-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .hero-content { grid-template-columns: 1fr; }
  .hero-visual { display: none; }
  .features-row { grid-template-columns: 1fr; }
  .menu-grid { grid-template-columns: repeat(2, 1fr); }
  .steps-row { flex-direction: column; align-items: center; }
  .step-connector { display: none; }
  .cta-card { flex-direction: column; text-align: center; padding: var(--space-8); }
  .cta-decoration { display: none; }
}
@media (max-width: 480px) {
  .menu-grid { grid-template-columns: 1fr; }
}
</style>
