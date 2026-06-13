<template>
  <div class="admin-reviews">
    <div class="page-top">
      <h2>Reseñas</h2>
      <div class="top-filters">
        <select v-model="approvedFilter" class="input" style="max-width:160px;" id="approved-filter">
          <option value="">Todas las Reseñas</option>
          <option value="true">Aprobadas</option>
          <option value="false">Pendientes</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="reviews-grid">
      <div v-for="n in 6" :key="n" class="review-skeleton glass-card">
        <div class="skeleton" style="height:16px;width:40%;"></div>
        <div class="skeleton" style="height:14px;"></div>
        <div class="skeleton" style="height:14px;width:70%;"></div>
        <div class="skeleton" style="height:32px;width:180px;margin-top:var(--space-2);"></div>
      </div>
    </div>

    <div v-else-if="filtered.length === 0" class="empty-state">
      <div class="empty-icon">⭐</div>
      <p>No se encontraron reseñas</p>
    </div>

    <div v-else class="reviews-grid">
      <div v-for="r in filtered" :key="r.id" class="review-card glass-card">
        <div class="review-header">
          <div class="reviewer-avatar">{{ r.author_name?.charAt(0) ?? '?' }}</div>
          <div class="reviewer-info">
            <span class="reviewer-name">{{ r.author_name ?? 'Anónimo' }}</span>
            <span class="review-date">{{ formatDate(r.created_at) }}</span>
          </div>
          <div class="review-stars">{{ '⭐'.repeat(r.rating ?? 5) }}</div>
        </div>
        <p class="review-text">{{ r.review_text ?? r.review ?? '—' }}</p>
        <div class="review-actions">
          <span :class="`badge badge-${r.is_approved ? 'success' : 'warning'}`">
            {{ r.is_approved ? 'Aprobada' : 'Pendiente' }}
          </span>
          <button v-if="!r.is_approved" class="btn btn-ghost btn-sm" @click="approveReview(r.id)" :id="`approve-${r.id}`">
            ✓ Aprobar
          </button>
          <button class="btn btn-sm" style="color:var(--color-secondary)" @click="deleteReview(r.id)" :id="`del-review-${r.id}`">
            <Trash2 :size="14" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Trash2 } from '@lucide/vue'
import { reviewsApi } from '@/services/api'
import { useToast } from 'vue-toastification'

const toast = useToast()
const reviews = ref<any[]>([])
const loading = ref(true)
const approvedFilter = ref('')

const filtered = computed(() => {
  if (!approvedFilter.value) return reviews.value
  const approved = approvedFilter.value === 'true'
  return reviews.value.filter((r) => !!r.is_approved === approved)
})

function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' }) : '—' }

async function approveReview(id: number) {
  try { await reviewsApi.update(id, { is_approved: true }); const r = reviews.value.find((r) => r.id === id); if (r) r.is_approved = true; toast.success('Reseña aprobada') }
  catch { toast.error('Error al aprobar') }
}

async function deleteReview(id: number) {
  if (!confirm('¿Eliminar esta reseña?')) return
  try { await reviewsApi.delete(id); reviews.value = reviews.value.filter((r) => r.id !== id); toast.success('Reseña eliminada') }
  catch { toast.error('Error al eliminar') }
}

onMounted(async () => {
  try { const res = await reviewsApi.getAll({ page_limit: 200 }); reviews.value = res.data.data ?? res.data }
  catch { reviews.value = [] } finally { loading.value = false }
})
</script>

<style scoped>
.admin-reviews { display: flex; flex-direction: column; gap: var(--space-5); }
.page-top { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-4); }
.page-top h2 { font-size: 1.4rem; }
.top-filters { display: flex; gap: var(--space-3); }
.reviews-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-5); }
.review-skeleton { padding: var(--space-5); display: flex; flex-direction: column; gap: var(--space-3); }
.review-card { padding: var(--space-5); display: flex; flex-direction: column; gap: var(--space-4); }
.review-header { display: flex; align-items: center; gap: var(--space-3); }
.reviewer-avatar { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark)); color: var(--color-text-invert); font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.reviewer-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.reviewer-name { font-weight: 600; font-size: 0.875rem; color: var(--color-text); }
.review-date { font-size: 0.72rem; color: var(--color-text-3); }
.review-text { font-size: 0.85rem; color: var(--color-text-2); line-height: 1.6; flex: 1; }
.review-actions { display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap; }
.empty-state { text-align: center; padding: var(--space-12) 0; }
.empty-icon { font-size: 3rem; margin-bottom: var(--space-3); }
@media (max-width: 1024px) { .reviews-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) { .reviews-grid { grid-template-columns: 1fr; } }
</style>
