import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import ExploreView from '@/views/ExploreView.vue'
import PlaceDetailView from '@/views/PlaceDetailView.vue'
import MapView from '@/views/MapView.vue'
import CoursesView from '@/views/CoursesView.vue'
import CourseDetailView from '@/views/CourseDetailView.vue'
import EventsView from '@/views/EventsView.vue'
import ChatbotView from '@/views/ChatbotView.vue'
import AboutView from '@/views/AboutView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

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
    path: '/courses',
    name: 'courses',
    component: CoursesView,
    meta: { title: '여행코스' }
  },
  {
    path: '/courses/:id',
    name: 'course-detail',
    component: CourseDetailView,
    meta: { title: '코스 상세' }
  },
  {
    path: '/events',
    name: 'events',
    component: EventsView,
    meta: { title: '축제/행사' }
  },
  {
    path: '/chatbot',
    name: 'chatbot',
    component: ChatbotView,
    meta: { title: 'AI 챗봇' }
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
    meta: { title: '페이지를 찾을 수 없음' }
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