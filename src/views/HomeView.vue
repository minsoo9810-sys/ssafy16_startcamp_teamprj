<!-- filepath: d:\teamprj_startcamp\src\views\HomeView.vue -->
<template>
  <section class="hero-card">
    <div class="hero-copy">
      <p class="hero-label">LocalHub · 서울 권역</p>
      <h1>서울 관광 정보를 한눈에, 커뮤니티까지</h1>
      <p>
        공공데이터 기반으로 관광지·문화시설·쇼핑·코스 정보를 탐색하고,
        익명 커뮤니티와 AI 챗봇으로 의견과 정보를 나눠보세요.
      </p>

      <div class="hero-actions">
        <router-link class="btn btn-primary" to="/explore">둘러보기</router-link>
        <router-link class="btn btn-secondary" to="/community">커뮤니티 입장</router-link>
      </div>
    </div>

    <div class="hero-panel">
      <div class="hero-stat">
        <strong>공공데이터 기반</strong>
        <span>서울 권역의 장소 정보를 빠르게 탐색</span>
      </div>
      <div class="hero-stat">
        <strong>익명 커뮤니티</strong>
        <span>제목·내용·비밀번호로 게시글 작성</span>
      </div>
      <div class="hero-stat">
        <strong>AI 챗봇</strong>
        <span>관광지 추천 및 자연어 질의 응답</span>
      </div>
    </div>
  </section>

  <section class="feature-grid">
    <router-link class="feature-card" to="/explore">
      <h3>탐색/추천</h3>
      <p>유형, 자치구, 키워드로 장소를 찾습니다.</p>
    </router-link>

    <router-link class="feature-card" to="/map">
      <h3>지도</h3>
      <p>좌표 기반으로 위치를 한눈에 확인합니다.</p>
    </router-link>

    <router-link class="feature-card" to="/community">
      <h3>커뮤니티</h3>
      <p>익명 게시글을 쓰고 수정·삭제할 수 있습니다.</p>
    </router-link>

    <router-link class="feature-card" to="/chatbot">
      <h3>챗봇</h3>
      <p>관광지 추천과 지역 정보를 자연어로 확인합니다.</p>
    </router-link>
  </section>
</template>