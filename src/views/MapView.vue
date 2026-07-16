<!-- filepath: d:\teamprj_startcamp\src\views\MapView.vue -->
<template>
  <section class="page">
    <div class="page-heading">
      <div>
        <p class="eyebrow">지도 시각화</p>
        <h1>관광지·맛집 위치 지도</h1>
        <p class="page-subtitle">
          Leaflet 기반 지도에 마커를 표시하고, 카테고리/구 필터로 원하는 위치만 확인합니다.
        </p>
      </div>
    </div>

    <div v-if="loading" class="loading-shell">
      <div class="spinner"></div>
      <p>지도 데이터를 불러오는 중입니다...</p>
    </div>

    <div v-else-if="error" class="state-box error">{{ error }}</div>

    <div v-else class="map-layout">
      <aside class="map-sidebar">
        <div class="filter-group">
          <label class="filter-label" for="type-filter">카테고리</label>
          <select id="type-filter" v-model="selectedType">
            <option value="all">전체</option>
            <option value="tour">관광지</option>
            <option value="culture">문화시설</option>
            <option value="shopping">쇼핑</option>
            <option value="leisure">레포츠</option>
            <option value="lodging">숙박</option>
            <option value="festival">축제공연행사</option>
            <option value="course">여행코스</option>
            <option value="food">맛집</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label" for="district-filter">구</label>
          <select id="district-filter" v-model="selectedDistrict">
            <option value="all">전체</option>
            <option v-for="district in districtOptions" :key="district" :value="district">
              {{ district }}
            </option>
          </select>
        </div>

        <div class="result-count">
          표시된 장소: <strong>{{ filteredPlaces.length }}개</strong>
        </div>

        <div class="place-list">
          <button
            v-for="place in filteredPlaces.slice(0, 12)"
            :key="place.id || place.title"
            class="place-item-btn"
            @click="focusPlace(place)"
          >
            <span class="place-item-title">{{ place.title }}</span>
            <span class="place-item-meta">{{ place.typeLabel }} · {{ place.district || '구 정보 없음' }}</span>
          </button>
        </div>
      </aside>

      <div class="map-panel">
        <div ref="mapContainer" class="leaflet-map"></div>

        <div v-if="selectedPlace" class="detail-card">
          <h3>{{ selectedPlace.title }}</h3>
          <p>{{ selectedPlace.address || '주소 정보 없음' }}</p>
          <p class="detail-meta">{{ selectedPlace.typeLabel }} · {{ selectedPlace.district || '구 정보 없음' }}</p>
          <p v-if="selectedPlace.tel">{{ selectedPlace.tel }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { loadPlaces } from '@/api/place'
import type { PlaceRecord, PlaceType } from '@/types/place'

const places = ref<PlaceRecord[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const selectedType = ref<'all' | PlaceType>('course')
const selectedDistrict = ref<string>('all')
const selectedPlace = ref<PlaceRecord | null>(null)

const mapContainer = ref<HTMLElement | null>(null)

let map: L.Map | null = null
let markerLayer: L.LayerGroup | null = null

const defaultMarkerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const districtOptions = computed(() => {
  const districts = new Set<string>()
  places.value.forEach((place) => {
    if (place.district) districts.add(place.district)
  })
  return Array.from(districts).sort()
})

const filteredPlaces = computed(() => {
  return places.value.filter((place) => {
    const typeMatch = selectedType.value === 'all' || place.type === selectedType.value
    const districtMatch = selectedDistrict.value === 'all' || place.district === selectedDistrict.value
    return typeMatch && districtMatch
  })
})

function initMap() {
  if (map) return
  if (!mapContainer.value) return

  map = L.map(mapContainer.value, {
    zoomControl: true,
    scrollWheelZoom: true
  }).setView([37.5665, 126.9780], 11)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map)

  markerLayer = L.layerGroup().addTo(map)
}

function clearMarkers() {
  if (markerLayer) {
    markerLayer.clearLayers()
  }
}

function getPopupHtml(place: PlaceRecord): string {
  const imageUrl =
    (place as PlaceRecord & { firstimage?: string | null; imageUrl?: string | null }).firstimage ||
    (place as PlaceRecord & { imageUrl?: string | null }).imageUrl ||
    '/images/no-image.png'

  const title = place.title || '장소명 없음'
  const address = place.address || '주소 정보 없음'
  const description = place.description || '설명 정보가 없습니다.'

  return `
    <div class="map-info-bubble">
      <img class="map-info-bubble__thumb" src="${imageUrl}" alt="${title}" />
      <div class="map-info-bubble__body">
        <h4 class="map-info-bubble__title">${title}</h4>
        <p class="map-info-bubble__address">${address}</p>
        <p class="map-info-bubble__desc">${description}</p>
      </div>
    </div>
  `
}

function renderMarkers() {
  if (!map || !markerLayer) return

  clearMarkers()

  filteredPlaces.value.forEach((place) => {
    if (!place.lat || !place.lng) return

    const marker = L.marker([place.lat, place.lng], {
      title: place.title,
      icon: defaultMarkerIcon
    })

    marker.on('click', () => {
      selectedPlace.value = place
      if (map) {
        map.panTo([place.lat!, place.lng!])
      }
    })

    marker.bindPopup(
      L.popup({
        maxWidth: 320,
        minWidth: 280,
        className: 'custom-map-popup'
      }).setContent(getPopupHtml(place))
    )

    marker.addTo(markerLayer!)
  })

  // ⭐ [수정] map이 확실히 null이 아닐 때만 setView가 작동하도록 조건 추가
  if (map && filteredPlaces.value.length > 0 && filteredPlaces.value[0].lat && filteredPlaces.value[0].lng) {
    map.setView([filteredPlaces.value[0].lat!, filteredPlaces.value[0].lng!], 12)
  }
}

function focusPlace(place: PlaceRecord) {
  selectedPlace.value = place
  if (map && place.lat && place.lng) {
    map.setView([place.lat, place.lng], 15)
  }
}

onMounted(async () => {
  try {
    const result = await loadPlaces()
    places.value = result.items
  } catch (err) {
    error.value = err instanceof Error ? err.message : '지도 데이터를 불러오지 못했습니다.'
  } finally {
    loading.value = false
    await nextTick()
    initMap()
    renderMarkers()
  }
})

watch(filteredPlaces, () => {
  renderMarkers()
})

onBeforeUnmount(() => {
  if (map && markerLayer) {
    map.removeLayer(markerLayer)
  }
  if (map) {
    map.remove()
    map = null
  }
  markerLayer = null
})
</script>