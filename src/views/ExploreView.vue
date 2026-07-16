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
      
      <!-- 필터 선택 영역 (명칭 수정 반영) -->
      <div class="filter-wrapper">
        <!-- 1. '분류(카테고리)' -> '카테고리'로 수정 -->
        <div class="filter-group">
          <label for="category-filter">카테고리</label>
          <select id="category-filter" v-model="selectedCategory" @change="resetPage">
            <option value="">전체 카테고리</option>
            <option v-for="cat in categories" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>
        </div>

        <!-- 2. '지역(구)' -> '구'로 수정 -->
        <div class="filter-group">
          <label for="district-filter">구</label>
          <select id="district-filter" v-model="selectedDistrict" @change="resetPage">
            <!-- 3. '전체 서울' -> '서울 전체'로 수정 -->
            <option value="">서울 전체</option>
            <option v-for="dist in districts" :key="dist" :value="dist">
              {{ dist }}
            </option>
          </select>
        </div>
      </div>

      <!-- 12개씩 잘라낸 필터링된 목록 렌더링 -->
      <div class="result-grid" v-if="paginatedPlaces.length > 0">
        <article 
          v-for="place in paginatedPlaces" 
          :key="place.id || place.title" 
          class="result-card clickable-card"
          @click="openDetailModal(place)"
        >
          <!-- JSON 데이터 내 이미지 바인딩 -->
          <div class="card-image-box">
            <img 
              v-if="place.imageUrl || place.firstimage || place.firstimage2" 
              :src="place.imageUrl || place.firstimage || place.firstimage2 || ''" 
              :alt="place.title" 
              class="place-img"
              loading="lazy"
            />
            <div v-else class="no-image-placeholder">
              <span>📷 이미지 준비중</span>
            </div>
          </div>

          <div class="card-content-area">
            <div class="result-top">
              <span class="chip">{{ place.typeLabel || '장소' }}</span>
              <span class="chip chip-muted">{{ place.district || extractRegion(place.address || place.addr1) || '구 정보 없음' }}</span>
            </div>

            <h3>{{ place.title || '제목 없음' }}</h3>
            <p class="address-text">{{ place.address || place.addr1 || '주소 정보 없음' }}</p>
          </div>
        </article>
      </div>

      <!-- 필터 결과가 없을 때 표시 -->
      <div v-else class="no-results-box">
        <p>🔍 선택한 조건에 일치하는 장소가 없습니다.</p>
      </div>

      <!-- 페이지네이션 컨트롤러 막대 (필터 결과가 있을 때만 노출) -->
      <div class="pagination-container" v-if="filteredPlaces.length > 0">
        <button 
          :disabled="currentPage === 1" 
          @click="changePage(currentPage - 1)"
          class="page-btn"
        >
          이전
        </button>
        
        <span class="page-info">
          <strong>{{ currentPage }}</strong> / {{ totalPages }} 페이지
        </span>

        <button 
          :disabled="currentPage === totalPages" 
          @click="changePage(currentPage + 1)"
          class="page-btn"
        >
          다음
        </button>
      </div>

      <!-- [위치 이동] 총 항목 및 현재 검색/필터 결과 표시 영역을 맨 하단으로 배치 -->
      <div class="summary-grid-bottom" v-if="filteredPlaces.length > 0">
        <div class="summary-item">
          <span class="summary-label">총 항목:</span>
          <strong>{{ totalCount }}개</strong>
        </div>
        <div class="summary-item">
          <span class="summary-label">현재 검색/필터 결과:</span>
          <strong>{{ filteredPlaces.length }}개</strong>
        </div>
      </div>

    </div>

    <!-- 상세 정보를 보여주는 레이어 모달 팝업 -->
    <div class="modal-overlay" v-if="isModalOpen && selectedPlace" @click.self="closeModal">
      <div class="modal-content">
        <button class="close-btn" @click="closeModal">✕</button>
        
        <div class="modal-img-container">
          <img 
            v-if="selectedPlace.imageUrl || selectedPlace.firstimage || selectedPlace.firstimage2" 
            :src="selectedPlace.imageUrl || selectedPlace.firstimage || selectedPlace.firstimage2 || ''" 
            :alt="selectedPlace.title" 
            class="modal-main-img"
          />
          <div v-else class="modal-no-img">📷 등록된 이미지가 없습니다.</div>
        </div>
        
        <div class="modal-body">
          <div class="modal-badges">
            <span class="chip">{{ selectedPlace.typeLabel || '장소' }}</span>
            <span class="chip chip-muted">{{ selectedPlace.district || extractRegion(selectedPlace.address || selectedPlace.addr1) || '구 정보 없음' }}</span>
          </div>
          <h2>{{ selectedPlace.title }}</h2>
          <hr class="modal-divider" />
          <p class="modal-info-row"><strong>📍 주소:</strong> {{ selectedPlace.address || selectedPlace.addr1 || '주소 정보 없음' }}</p>
          <p class="modal-info-row" v-if="selectedPlace.tel"><strong>📞 연락처:</strong> {{ selectedPlace.tel }}</p>
          <p class="modal-info-row" v-if="selectedPlace.zipcode"><strong>📮 우편번호:</strong> {{ selectedPlace.zipcode }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { loadPlaces } from '@/api/place'
import type { PlaceRecord } from '@/types/place'

// ==========================================
// 1. 상태(State) 정의
// ==========================================
const places = ref<PlaceRecord[]>([])
const address = (place as any).addr1;
const zip = (place as any).zipcode;
const loading = ref(true)
const error = ref<string | null>(null)

const currentPage = ref<number>(1) // 현재 활성화된 페이지 번호
const itemsPerPage = 12             // 한 페이지당 보여줄 장소 개수

const isModalOpen = ref<boolean>(false)
const selectedPlace = ref<PlaceRecord | null>(null)

const selectedCategory = ref<string>('')
const selectedDistrict = ref<string>('')

// ==========================================
// 2. computed 연산 영역
// ==========================================
const totalCount = computed(() => places.value.length)

// 데이터에서 고유한 카테고리(typeLabel) 목록 자동 추출
const categories = computed<string[]>(() => {
  const allCategories = places.value.map(p => p.typeLabel).filter(Boolean) as string[]
  return [...new Set(allCategories)].sort()
})

// 데이터에서 고유한 지역(구) 목록 자동 추출 (구 정보 필드가 없으면 주소에서 파싱)
const districts = computed<string[]>(() => {
  const allDistricts = places.value.map(p => {
    return p.district || extractRegion(p.address || p.addr1)
  }).filter(Boolean) as string[]
  return [...new Set(allDistricts)].sort()
})

// 카테고리와 지역 필터가 적용된 최종 데이터 필터링 계산식
const filteredPlaces = computed<PlaceRecord[]>(() => {
  return places.value.filter(place => {
    // 카테고리 조건 비교
    const matchCategory = !selectedCategory.value || place.typeLabel === selectedCategory.value
    // 지역 조건 비교
    const placeDistrict = place.district || extractRegion(place.address || place.addr1)
    const matchDistrict = !selectedDistrict.value || placeDistrict === selectedDistrict.value
    
    return matchCategory && matchDistrict
  })
})

// 필터링된 데이터(filteredPlaces)를 기준으로 12개 자르기
const paginatedPlaces = computed<PlaceRecord[]>(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return (filteredPlaces.value || []).slice(start, end)
})

// 전체 페이지 수 연산 기준도 'filteredPlaces'로 변경
const totalPages = computed<number>(() => {
  const totalLength = filteredPlaces.value ? filteredPlaces.value.length : 0
  return Math.ceil(totalLength / itemsPerPage) || 1
})

// ==========================================
// 3. 메소드 / 함수 영역
// ==========================================
const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const resetPage = () => {
  currentPage.value = 1
}

const openDetailModal = (place: PlaceRecord) => {
  selectedPlace.value = place
  isModalOpen.value = true
}

const closeModal = () => {
  selectedPlace.value = null
  isModalOpen.value = false
}

// 주소에서 '구' 파싱 헬퍼 함수
const extractRegion = (address?: string) => {
  if (!address) return '';
  const parts = address.split(' ');
  if (parts[0].includes('서울') && parts[1]) {
    return parts[1];
  }
  return '';
};

// 필터 조건이 바뀔 때 자동으로 1페이지로 복귀시키도록 감시
watch([selectedCategory, selectedDistrict], () => {
  resetPage()
})

// ==========================================
// 4. API 데이터 로드 실행
// ==========================================
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
</script>

<style scoped>
/* 필터 래퍼 스타일 */
.filter-wrapper {
  display: flex;
  gap: 20px;
  background-color: #f8f9fa;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 25px;
  border: 1px solid #e9ecef;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}
.filter-group label {
  font-size: 13px;
  font-weight: 600;
  color: #495057;
}
.filter-group select {
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  background-color: #fff;
  color: #495057;
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s ease-in-out;
}
.filter-group select:focus {
  border-color: #80bdff;
}

/* 필터 결과 없음 상자 */
.no-results-box {
  text-align: center;
  padding: 60px 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #dee2e6;
  color: #6c757d;
  font-size: 15px;
}

/* 카드 호버 및 구조적 디자인 확보 */
.clickable-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.clickable-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}

/* 이미지 관련 카드 영역 디자인 */
.card-image-box {
  width: 100%;
  height: 160px;
  background-color: #eaeaea;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.place-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.no-image-placeholder {
  color: #888;
  font-size: 13px;
}
.card-content-area {
  padding: 15px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
.address-text {
  font-size: 13px;
  color: #666;
  margin-top: auto;
}

/* 페이지네이션 스타일 */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
  margin-bottom: 20px; /* 아래 요약 정보와의 간격 조절 */
}
.page-btn {
  padding: 8px 16px;
  border: 1px solid #ccc;
  background-color: #fff;
  color: #333;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  transition: background-color 0.2s;
}
.page-btn:hover:not(:disabled) {
  background-color: #f0f0f0;
}
.page-btn:disabled {
  background-color: #f5f5f5;
  color: #aaa;
  cursor: not-allowed;
  border-color: #ddd;
}
.page-info {
  font-size: 15px;
  color: #555;
}

/* [추가] 맨 하단으로 이동한 요약 정보 영역 스타일 */
.summary-grid-bottom {
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #dee2e6;
}
.summary-item {
  font-size: 14px;
  color: #495057;
}
.summary-item .summary-label {
  color: #868e96;
  margin-right: 6px;
}
.summary-item strong {
  font-size: 15px;
  color: #212529;
}

/* 모달 시스템 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 25px;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
}
.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  z-index: 10;
}
.modal-img-container {
  width: 100%;
  height: 250px;
  background-color: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 15px;
}
.modal-main-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.modal-no-img {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #777;
}
.modal-body h2 {
  margin: 10px 0;
  font-size: 20px;
  color: #222;
}
.modal-badges {
  display: flex;
  gap: 8px;
  margin-bottom: 5px;
}
.modal-divider {
  border: 0;
  height: 1px;
  background: #eaeaea;
  margin: 15px 0;
}
.modal-info-row {
  font-size: 14px;
  color: #444;
  margin: 8px 0;
  line-height: 1.5;
}
</style>