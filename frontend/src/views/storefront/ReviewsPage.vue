<template>
  <div class="reviews-page">
    <div class="container">
      <div class="section-header">
        <span class="eyebrow">What Our Guests Say</span>
        <h1>Reviews & <span class="text-gradient">Ratings</span></h1>
        <p>Real experiences from our valued guests.</p>
      </div>

      <!-- Write review -->
      <div class="write-review glass-card" v-if="auth.isLoggedIn">
        <h3>Leave a Review</h3>
        <div class="star-select">
          <button v-for="n in 5" :key="n" class="star-btn" :class="{ active: form.rating >= n }" @click="form.rating = n" :id="`star-${n}`">⭐</button>
        </div>
        <textarea v-model="form.review_text" class="input" rows="4" placeholder="Share your experience..."></textarea>
        <button class="btn btn-primary" @click="submitReview" :disabled="loading" id="submit-review-btn">
          <span v-if="loading" class="spinner"></span>
          <span v-else>Submit Review</span>
        </button>
      </div>
      <div class="login-prompt glass-card" v-else>
        <span>🌟</span>
        <p>Sign in to leave a review</p>
        <RouterLink to="/login" class="btn btn-outline btn-sm">Sign In</RouterLink>
      </div>

      <!-- Reviews list -->
      <div v-if="loadingReviews" class="reviews-grid">
        <div v-for="n in 6" :key="n" class="review-skeleton glass-card">
          <div class="skeleton" style="height:16px; width:40%;"></div>
          <div class="skeleton" style="height:14px;"></div>
          <div class="skeleton" style="height:14px; width:70%;"></div>
        </div>
      </div>

      <div v-else-if="reviews.length > 0" class="reviews-grid">
        <div v-for="r in reviews" :key="r.id" class="review-card glass-card">
          <div class="review-header">
            <div class="reviewer-avatar">{{ r.author_name?.charAt(0) ?? '?' }}</div>
            <div class="reviewer-info">
              <span class="reviewer-name">{{ r.author_name ?? 'Guest' }}</span>
              <span class="review-date">{{ formatDate(r.created_at) }}</span>
            </div>
            <div class="review-stars">{{ '⭐'.repeat(r.rating ?? 5) }}</div>
          </div>
          <p class="review-text">{{ r.review_text ?? r.review }}</p>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">⭐</div>
        <h3>No reviews yet</h3>
        <p>Be the first to share your experience!</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { reviewsApi } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

const auth = useAuthStore()
const toast = useToast()
const reviews = ref<any[]>([])
const loadingReviews = ref(true)
const loading = ref(false)
const form = ref({ rating: 5, review_text: '' })

async function fetchReviews() {
  try {
    const res = await reviewsApi.getAll({ page_limit: 50, is_approved: true })
    reviews.value = res.data.data ?? res.data
  } catch { reviews.value = [] } finally { loadingReviews.value = false }
}

async function submitReview() {
  if (!form.value.review_text.trim()) { toast.error('Please write a review'); return }
  loading.value = true
  try {
    await reviewsApi.create({ ...form.value })
    toast.success('Review submitted! Thank you.')
    form.value = { rating: 5, review_text: '' }
    await fetchReviews()
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? 'Failed to submit review')
  } finally { loading.value = false }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })
}

onMounted(fetchReviews)
</script>

<style scoped>
.reviews-page { padding: var(--space-12) 0 var(--space-16); }
.write-review { padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-4); max-width: 600px; margin: 0 auto var(--space-10); }
.write-review h3 { font-family: var(--font-heading); }
.star-select { display: flex; gap: var(--space-2); }
.star-btn { font-size: 1.8rem; background: none; border: none; cursor: pointer; opacity: 0.3; transition: opacity var(--transition-fast), transform var(--transition-fast); }
.star-btn.active { opacity: 1; }
.star-btn:hover { transform: scale(1.2); opacity: 1; }
.login-prompt {
  display: flex; align-items: center; justify-content: center; gap: var(--space-4);
  padding: var(--space-5); max-width: 400px; margin: 0 auto var(--space-10);
  font-size: 1.5rem;
}
.login-prompt p { flex: 1; font-size: 0.95rem; color: var(--color-text-2); }

.reviews-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-5); }
.review-skeleton { padding: var(--space-5); display: flex; flex-direction: column; gap: var(--space-3); }
.review-card { padding: var(--space-5); display: flex; flex-direction: column; gap: var(--space-4); }
.review-header { display: flex; align-items: center; gap: var(--space-3); }
.reviewer-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: var(--color-text-invert); font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.reviewer-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.reviewer-name { font-weight: 600; font-size: 0.9rem; color: var(--color-text); }
.review-date { font-size: 0.75rem; color: var(--color-text-3); }
.review-stars { font-size: 0.85rem; }
.review-text { font-size: 0.875rem; color: var(--color-text-2); line-height: 1.7; }

.empty-state { text-align: center; padding: var(--space-16) 0; }
.empty-icon { font-size: 4rem; margin-bottom: var(--space-4); }

@media (max-width: 1024px) { .reviews-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) { .reviews-grid { grid-template-columns: 1fr; } }
</style>
