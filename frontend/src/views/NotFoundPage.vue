<template>
  <div class="not-found">
    <div class="nf-bg"></div>
    <div class="nf-content">
      <div class="nf-number">404</div>
      <div class="nf-emoji">🍽️</div>
      <h1>Página No Encontrada</h1>
      <p>Vaya, parece que este plato no está en nuestro menú. Volvamos al buen camino.</p>
      <div class="nf-actions">
        <RouterLink to="/" class="btn btn-primary btn-lg" id="go-home-btn">
          🏠 Volver al Inicio
        </RouterLink>
        <RouterLink to="/menu" class="btn btn-outline btn-lg" id="go-menu-btn">
          Ver Menú
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  text-align: center;
}
.nf-bg {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at center, rgba(245,158,11,0.07) 0%, transparent 60%), var(--color-bg);
}
.nf-content {
  position: relative; z-index: 1;
  display: flex; flex-direction: column; align-items: center; gap: var(--space-5);
  padding: var(--space-8);
}
.nf-number {
  font-size: clamp(6rem, 15vw, 12rem);
  font-family: var(--font-heading);
  font-weight: 700;
  line-height: 1;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  opacity: 0.8;
}
.nf-emoji { font-size: 4rem; animation: float 3s ease-in-out infinite; }
.nf-content h1 { font-size: clamp(1.5rem, 4vw, 2.5rem); }
.nf-content p { max-width: 400px; font-size: 1.05rem; }
.nf-actions { display: flex; gap: var(--space-4); flex-wrap: wrap; justify-content: center; margin-top: var(--space-4); }
</style>
