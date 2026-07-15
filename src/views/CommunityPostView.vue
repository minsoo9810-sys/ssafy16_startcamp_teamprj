<!-- filepath: d:\teamprj_startcamp\src\views\CommunityPostView.vue -->
<template>
  <section v-if="post" class="page">
    <div class="page-heading">
      <div>
        <p class="eyebrow">게시글 상세</p>
        <h1>{{ post.title }}</h1>
        <p class="page-subtitle">{{ formatDate(post.updatedAt) }}</p>
      </div>
      <router-link class="btn btn-secondary" to="/community">목록으로</router-link>
    </div>

    <div v-if="!isEditing" class="detail-shell">
      <div class="post-body">{{ post.content }}</div>

      <div class="form-actions">
        <button @click="isEditing = true">수정하기</button>
        <button class="danger" @click="deletePost">삭제하기</button>
      </div>
    </div>

    <form v-else class="community-form" @submit.prevent="saveEdit">
      <label>
        제목
        <input v-model="editForm.title" type="text" required />
      </label>

      <label>
        내용
        <textarea v-model="editForm.content" rows="8" required />
      </label>

      <div class="form-actions">
        <button type="submit">저장</button>
        <button type="button" class="secondary" @click="isEditing = false">
          취소
        </button>
      </div>
    </form>

    <div v-if="message" class="state-box">{{ message }}</div>
  </section>

  <section v-else class="page">
    <div class="page-heading">
      <div>
        <p class="eyebrow">게시글 오류</p>
        <h1>게시글이 없습니다</h1>
        <p class="page-subtitle">존재하지 않는 게시글이거나 삭제된 게시글입니다.</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { CommunityPost } from '@/types/community'
import {
  deleteCommunityPost,
  getCommunityPostById,
  updateCommunityPost
} from '@/utils/community'

const route = useRoute()
const router = useRouter()

const post = ref<CommunityPost | null>(null)
const isEditing = ref(false)
const message = ref('')

const editForm = reactive({
  title: '',
  content: ''
})

function loadPost() {
  const postId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  const found = getCommunityPostById(postId)

  post.value = found

  if (found) {
    editForm.title = found.title
    editForm.content = found.content
  }
}

onMounted(loadPost)
watch(() => route.params.id, loadPost)

function formatDate(value: string): string {
  return new Date(value).toLocaleString('ko-KR')
}

function saveEdit() {
  if (!post.value) return

  const password = window.prompt('수정 비밀번호를 입력하세요')
  if (!password) return

  const updated = updateCommunityPost(post.value.id, {
    title: editForm.title,
    content: editForm.content,
    password
  })

  if (!updated) {
    message.value = '비밀번호가 올바르지 않습니다.'
    return
  }

  post.value = updated
  isEditing.value = false
  message.value = '수정되었습니다.'
}

function deletePost() {
  if (!post.value) return

  const password = window.prompt('삭제 비밀번호를 입력하세요')
  if (!password) return

  const success = deleteCommunityPost(post.value.id, password)

  if (!success) {
    message.value = '비밀번호가 올바르지 않습니다.'
    return
  }

  router.push('/community')
}
</script>