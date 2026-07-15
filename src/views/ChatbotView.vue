<!-- filepath: d:\teamprj_startcamp\src\views\ChatbotView.vue -->
<template>
  <section class="page">
    <div class="page-heading">
      <div>
        <p class="eyebrow">AI 챗봇</p>
        <h1>지역 정보 질의 응답</h1>
        <p class="page-subtitle">
          관광지 추천, 축제/행사 정보, 커뮤니티 글 검색 느낌의 자연어 질의에 응답합니다.
        </p>
      </div>
    </div>

    <div class="chat-shell">
      <div class="chat-list">
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['chat-bubble', message.role === 'user' ? 'user' : 'assistant']"
        >
          {{ message.content }}
        </div>

        <div v-if="loading" class="chat-bubble assistant loading">
          답변 생성 중...
        </div>
      </div>

      <form class="chat-input-box" @submit.prevent="sendMessage">
        <input
          v-model="input"
          type="text"
          placeholder="예: 서울에서 조용한 카페를 추천해줘"
          :disabled="loading"
        />
        <button type="submit" :disabled="loading">
          {{ loading ? '전송 중' : '전송' }}
        </button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { sendChatbotMessage, type ChatMessage } from '@/api/openai'

const messages = ref<ChatMessage[]>([
  {
    role: 'assistant',
    content: '안녕하세요! LocalHub 챗봇입니다. 서울 권역의 관광지, 커뮤니티 정보, 추천 질문을 도와드릴게요.'
  }
])

const input = ref('')
const loading = ref(false)

async function sendMessage() {
  const text = input.value.trim()
  if (!text || loading.value) return

  const userMessage: ChatMessage = {
    role: 'user',
    content: text
  }

  messages.value = [...messages.value, userMessage]
  input.value = ''
  loading.value = true

  try {
    const answer = await sendChatbotMessage(text, messages.value)
    messages.value = [...messages.value, { role: 'assistant', content: answer }]
  } catch {
    messages.value = [
      ...messages.value,
      { role: 'assistant', content: '응답 생성 중 오류가 발생했습니다.' }
    ]
  } finally {
    loading.value = false
  }
}
</script>