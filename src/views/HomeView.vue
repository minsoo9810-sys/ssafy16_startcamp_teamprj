<!-- filepath: d:\teamprj_startcamp\src\views\HomeView.vue -->
<template>
  <section class="page">
    <h1>LocalHub 서울 권역</h1>
    <p>관광지, 문화시설, 레포츠, 코스, 지도, 챗봇을 한 번에 탐색하는 메인 화면입니다.</p>

    <div class="card-grid">
      <router-link class="card" to="/explore">탐색/추천</router-link>
      <router-link class="card" to="/map">지도 보기</router-link>
      <router-link class="card" to="/courses">여행코스</router-link>
      <router-link class="card" to="/chatbot">AI 챗봇</router-link>
    </div>
  </section>
</template>