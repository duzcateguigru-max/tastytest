<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <!-- Brand -->
        <div class="footer-brand">
          <div class="brand-logo">
            <span class="logo-emoji">🍽️</span>
            <span>FlavorHaven</span>
          </div>
          <p>Vive la mejor gastronomía, entregada a tu puerta o disfrutada en nuestras mesas. Calidad que se siente en cada bocado.</p>
          <div class="social-links">
            <a href="#" class="social-btn" aria-label="Facebook">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="#" class="social-btn" aria-label="Instagram">
              <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="#" class="social-btn" aria-label="Twitter">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
            </a>
          </div>
        </div>

        <!-- Quick links -->
        <div class="footer-col">
          <h4>Explorar</h4>
          <ul>
            <li><RouterLink to="/menu">Nuestro Menú</RouterLink></li>
            <li><RouterLink to="/reservations">Reservar Mesa</RouterLink></li>
            <li><RouterLink to="/reviews">Reseñas</RouterLink></li>
            <li><RouterLink to="/orders">Rastrear Pedido</RouterLink></li>
          </ul>
        </div>

        <!-- Account -->
        <div class="footer-col">
          <h4>Mi Cuenta</h4>
          <ul>
            <li><RouterLink to="/login">Iniciar Sesión</RouterLink></li>
            <li><RouterLink to="/register">Crear Cuenta</RouterLink></li>
            <li><RouterLink to="/profile">Mi Perfil</RouterLink></li>
            <li><RouterLink to="/orders">Historial de Pedidos</RouterLink></li>
          </ul>
        </div>

        <!-- Contact -->
        <div class="footer-col">
          <h4>Visítanos</h4>
          <ul>
            <li class="contact-item">📍 123 Av. Gourmet, Ciudad Sabor</li>
            <li class="contact-item">📞 +1 (555) 123-4567</li>
            <li class="contact-item">✉️ hola@flavorhaven.com</li>
            <li class="contact-item">🕐 Lun–Dom: 11am – 10pm</li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p>© {{ new Date().getFullYear() }} FlavorHaven. Todos los derechos reservados.</p>
        <div class="footer-links">
          <a href="#">Política de Privacidad</a>
          <a href="#">Términos de Servicio</a>
          <a href="#">Política de Cookies</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.footer {
  background: var(--color-bg-2);
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-16);
  padding-bottom: var(--space-8);
  margin-top: var(--space-20);
}
.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: var(--space-10);
  margin-bottom: var(--space-12);
}
.footer-brand .brand-logo {
  display: flex; align-items: center; gap: var(--space-3);
  font-family: var(--font-heading); font-size: 1.3rem; font-weight: 700;
  margin-bottom: var(--space-4);
}
.logo-emoji { font-size: 1.6rem; }
.footer-brand p { font-size: 0.9rem; line-height: 1.7; max-width: 280px; margin-bottom: var(--space-5); }
.social-links { display: flex; gap: var(--space-3); }
.social-btn {
  width: 36px; height: 36px;
  display: flex; align-items: center; justify-content: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-2);
  transition: all var(--transition-fast);
}
.social-btn:hover { color: var(--color-primary); border-color: var(--color-primary); background: var(--color-primary-dim); }

.footer-col h4 {
  font-size: 0.85rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.1em;
  color: var(--color-text); margin-bottom: var(--space-5);
  font-family: var(--font-body);
}
.footer-col ul { display: flex; flex-direction: column; gap: var(--space-3); }
.footer-col ul li a, .footer-col ul li.contact-item {
  font-size: 0.875rem; color: var(--color-text-2);
  transition: color var(--transition-fast);
}
.footer-col ul li a:hover { color: var(--color-primary); }

.footer-bottom {
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-6);
  display: flex; align-items: center; justify-content: space-between;
}
.footer-bottom p { font-size: 0.85rem; }
.footer-links { display: flex; gap: var(--space-5); }
.footer-links a { font-size: 0.85rem; color: var(--color-text-3); transition: color var(--transition-fast); }
.footer-links a:hover { color: var(--color-text-2); }

@media (max-width: 1024px) {
  .footer-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 640px) {
  .footer-grid { grid-template-columns: 1fr; }
  .footer-bottom { flex-direction: column; gap: var(--space-4); text-align: center; }
}
</style>
