import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import ExploreView from '@/views/ExploreView.vue'
import PlaceDetailView from '@/views/PlaceDetailView.vue'
import MapView from '@/views/MapView.vue'
import CommunityView from '@/views/CommunityView.vue'
import CommunityWriteView from '@/views/CommunityWriteView.vue'
import CommunityPostView from '@/views/CommunityPostView.vue'
import ChatbotView from '@/views/ChatbotView.vue'
import AboutView from '@/views/AboutView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import RegionIntroView from '@/views/RegionIntroView.vue'


const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: '홈' }
  },
  {
    path: '/explore',
    name: 'explore',
    component: ExploreView,
    meta: { title: '탐색/추천' }
  },
  {
    path: '/explore/:id',
    name: 'place-detail',
    component: PlaceDetailView,
    meta: { title: '관광지 상세' }
  },
  {
    path: '/map',
    name: 'map',
    component: MapView,
    meta: { title: '지도' }
  },
  {
    path: '/community',
    name: 'community',
    component: CommunityView,
    meta: { title: '커뮤니티' }
  },
  {
    path: '/community/write',
    name: 'community-write',
    component: CommunityWriteView,
    meta: { title: '게시글 작성' }
  },
  {
    path: '/community/:id',
    name: 'community-post',
    component: CommunityPostView,
    meta: { title: '게시글 상세' }
  },
  {
    path: '/chatbot',
    name: 'chatbot',
    component: ChatbotView,
    meta: { title: '챗봇' }
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView,
    meta: { title: '정보' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: { title: '페이지 없음' }
  },
  {
  path: '/regions',
  name: 'regions',
  component: RegionIntroView,
  meta: { title: '권역 소개' }
}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const title = typeof to.meta.title === 'string' ? to.meta.title : '홈'
  document.title = `${title} | LocalHub`
})

export default router