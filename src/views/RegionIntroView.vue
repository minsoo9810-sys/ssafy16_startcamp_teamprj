<!-- filepath: d:\teamprj_startcamp\src\views\RegionIntroView.vue -->
<template>
  <section class="page">
    <div class="page-heading">
      <div>
        <p class="eyebrow">권역 소개</p>
        <h1>실제 서울 장소 기반 권역 소개</h1>
        <p class="page-subtitle">
          공공데이터에서 가져온 실제 장소의 이미지, 제목, 주소를 이용해 권역 소개 카드로 보여줍니다.
        </p>
      </div>
    </div>

    <div v-if="loading" class="loading-shell">
      <div class="spinner"></div>
      <p>실제 장소 데이터를 불러오는 중입니다...</p>
    </div>

    <div v-else-if="error" class="state-box error">{{ error }}</div>

    <div v-else>
      <div class="region-hero">
        <div class="region-hero-copy">
          <p class="hero-label">실제 서울 장소 기반</p>
          <h2>{{ heroPlace?.title || '대표 장소' }}</h2>
          <p>{{ heroPlace?.address || '주소 정보 없음' }}</p>
          <p>{{ heroPlace?.description || '실제 데이터에 있는 장소 정보입니다.' }}</p>
        </div>

        <div class="region-hero-media">
          <img
            :src="getPlaceImage(heroPlace)"
            :alt="heroPlace?.title || '대표 장소 이미지'"
          />
        </div>
      </div>

      <div class="region-grid">
        <article
          v-for="place in featuredPlaces"
          :key="place.id || place.title"
          class="region-card"
        >
          <img :src="getPlaceImage(place)" :alt="place.title" />
          <div class="region-card-body">
            <h3>{{ place.title }}</h3>
            <p>{{ place.address || '주소 정보 없음' }}</p>

            <div class="region-badges">
              <span class="region-badge">{{ place.district || '서울' }}</span>
              <span class="region-badge">{{ place.typeLabel || '장소' }}</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { loadPlaces } from '@/api/place'
import type { PlaceRecord } from '@/types/place'

const featuredPlaces = ref<PlaceRecord[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const result = await loadPlaces()

    const items = (result.items || []).filter((place) => {
      const image = getPlaceImage(place)
      return Boolean(place.title && (place.address || image))
    })

    featuredPlaces.value = items.slice(0, 6)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '데이터를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
})

function getPlaceImage(place: PlaceRecord | null | undefined): string {
  if (!place) {
    return 'https://images.unsplash.com/photo-1527153818091-1a9638521e2a?auto=format&fit=crop&w=1200&q=80'
  }

  const firstimage = (place as PlaceRecord & {
    firstimage?: string | null
    firstimage2?: string | null
    imageUrl?: string | null
  }).firstimage

  const firstimage2 = (place as PlaceRecord & {
    firstimage2?: string | null
  }).firstimage2

  const imageUrl = (place as PlaceRecord & {
    imageUrl?: string | null
  }).imageUrl

  return firstimage || firstimage2 || imageUrl || 'https://images.unsplash.com/photo-1527153818091-1a9638521e2a?auto=format&fit=crop&w=1200&q=80'
}

const heroPlace = computed(() => featuredPlaces.value[0] || null)
</script>