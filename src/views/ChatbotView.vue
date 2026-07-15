<!-- filepath: d:\teamprj_startcamp\src\views\ChatbotView.vue -->
<template>
  <section class="page">
    <div class="page-heading">
      <div>
        <p class="eyebrow">AI 챗봇</p>
        <h1>지역 정보 질의 응답</h1>
        <p class="page-subtitle">
          관광지 추천, 행사 정보, 커뮤니티 검색 등 자연어 질의를 지원합니다.
        </p>
      </div>
    </div>

    <div class="chat-shell">
      <div class="chat-bubble bot">
        안녕하세요. LocalHub 챗봇입니다. 어떤 정보를 찾고 계신가요?
      </div>

      <div class="chat-bubble user">
        서울에서 조용한 카페를 추천해줘.
      </div>

      <div class="chat-input-box">
        <input type="text" placeholder="질문을 입력해보세요" />
        <button>전송</button>
      </div>
    </div>
  </section>
</template>