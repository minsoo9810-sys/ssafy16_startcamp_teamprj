<!-- filepath: d:\teamprj_startcamp\src\views\ExploreView.vue -->
<template>
  <section class="page">
    <div class="page-heading">
      <div>
        <p class="eyebrow">공공데이터 탐색</p>
        <h1>관광지·문화시설·쇼핑·코스 정보</h1>
        <p class="page-subtitle">
          브라우저에서 제공된 JSON 데이터를 직접 읽어 카드형으로 확인합니다.
        </p>
      </div>
      <router-link class="btn btn-secondary" to="/community">커뮤니티 보기</router-link>
    </div>

    <div v-if="loading" class="loading-shell">
      <div class="spinner"></div>
      <p>데이터를 불러오는 중입니다...</p>
    </div>

    <div v-else-if="error" class="state-box error">{{ error }}</div>

    <div v-else class="data-stack">
      <div class="summary-grid">
        <article class="summary-card">
          <p class="summary-label">총 항목</p>
          <strong>{{ totalCount }}개</strong>
        </article>
        <article class="summary-card">
          <p class="summary-label">미리보기</p>
          <strong>{{ displayPlaces.length }}개</strong>
        </article>
      </div>

      <div class="result-grid">
        <article v-for="place in displayPlaces" :key="place.id || place.title" class="result-card">
          <div class="result-top">
            <span class="chip">{{ place.typeLabel }}</span>
            <span class="chip chip-muted">{{ place.district || '구 정보 없음' }}</span>
          </div>

          <h3>{{ place.title || '제목 없음' }}</h3>
          <p>{{ place.address || '주소 정보 없음' }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { loadPlaces } from '@/api/place'
import type { PlaceRecord } from '@/types/place'

const places = ref<PlaceRecord[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const result = await loadPlaces()
    places.value = result.items
  } catch (err) {
    error.value = err instanceof Error ? err.message : '데이터를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
})

const totalCount = computed(() => places.value.length)
const displayPlaces = computed(() => places.value.slice(0, 12))
</script>