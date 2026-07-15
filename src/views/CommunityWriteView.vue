<!-- filepath: d:\teamprj_startcamp\src\views\CommunityWriteView.vue -->
<template>
  <section class="page">
    <div class="page-heading">
      <div>
        <p class="eyebrow">게시글 작성</p>
        <h1>새 게시글 등록</h1>
        <p class="page-subtitle">
          제목, 내용, 수정용 비밀번호를 입력해 익명 게시글을 작성합니다.
        </p>
      </div>
      <router-link class="btn btn-secondary" to="/community">목록으로</router-link>
    </div>

    <form class="community-form" @submit.prevent="submitPost">
      <label>
        제목
        <input v-model="form.title" type="text" required />
      </label>

      <label>
        내용
        <textarea v-model="form.content" rows="8" required />
      </label>

      <label>
        수정 비밀번호
        <input v-model="form.password" type="password" required />
      </label>

      <div class="form-actions">
        <button type="submit">작성하기</button>
        <button type="button" class="secondary" @click="router.push('/community')">
          취소
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { createCommunityPost } from '@/utils/community'

const router = useRouter()

const form = reactive({
  title: '',
  content: '',
  password: ''
})

function submitPost() {
  if (!form.title.trim() || !form.content.trim() || !form.password.trim()) {
    return
  }

  createCommunityPost({
    title: form.title,
    content: form.content,
    password: form.password
  })

  router.push('/community')
}
</script>