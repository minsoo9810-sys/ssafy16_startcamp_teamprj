<!-- filepath: d:\teamprj_startcamp\src\views\CommunityView.vue -->
<template>
  <section class="page">
    <div class="page-heading">
      <div>
        <p class="eyebrow">익명 커뮤니티</p>
        <h1>지역 정보 공유 게시판</h1>
        <p class="page-subtitle">
          제목·내용·비밀번호로 익명 게시글을 작성하고 수정·삭제할 수 있습니다.
        </p>
      </div>

      <router-link class="btn btn-primary" to="/community/write">새 글 작성</router-link>
    </div>

    <div v-if="posts.length === 0" class="community-empty">
      아직 작성된 글이 없습니다. 첫 글을 작성해보세요.
    </div>

    <div v-else class="community-grid">
      <router-link
        v-for="post in posts"
        :key="post.id"
        class="community-card"
        :to="`/community/${post.id}`"
      >
        <div class="community-card-top">
          <span class="chip">게시글</span>
          <span class="chip chip-muted">{{ formatDate(post.updatedAt) }}</span>
        </div>

        <h3>{{ post.title }}</h3>
        <p>{{ post.content }}</p>
      </router-link>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { CommunityPost } from '@/types/community'
import { readCommunityPosts } from '@/utils/community'

const posts = ref<CommunityPost[]>([])

function loadPosts() {
  posts.value = readCommunityPosts()
}

onMounted(loadPosts)

function formatDate(value: string): string {
  return new Date(value).toLocaleString('ko-KR')
}
</script>