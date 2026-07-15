<!-- filepath: d:\teamprj_startcamp\src\views\ExploreView.vue -->
<template>
  <section class="page">
    <h1>탐색/추천</h1>
    <p>공공데이터 JSON을 프론트엔드에서 직접 읽어와 화면에 표시하는 예시 페이지입니다.</p>

    <div v-if="loading" class="state-box">데이터를 불러오는 중입니다...</div>
    <div v-else-if="error" class="state-box error">{{ error }}</div>
    <div v-else>
      <p class="summary">로드된 항목 수: {{ totalCount }}개</p>

      <ul class="place-list">
        <li v-for="place in previewPlaces" :key="place.id || place.title" class="place-item">
          <div class="place-title">{{ place.title || '제목 없음' }}</div>
          <div class="place-meta">{{ place.typeLabel }}</div>
          <div>{{ place.address || '주소 없음' }}</div>
        </li>
      </ul>
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
const previewPlaces = computed(() => places.value.slice(0, 10))
</script>