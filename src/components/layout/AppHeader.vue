<!-- filepath: d:\teamprj_startcamp\src\components\layout\AppHeader.vue -->
<template>
  <header class="app-header">
    <div class="brand-block">
      <router-link class="brand" to="/">LocalHub</router-link>
      <span class="brand-subtitle">서울 권역 탐색</span>
    </div>

    <nav class="nav">
      <router-link class="nav-link" to="/explore">탐색</router-link>
      <router-link class="nav-link" to="/map">지도</router-link>
      <router-link class="nav-link" to="/community">커뮤니티</router-link>
      <router-link class="nav-link" to="/chatbot">챗봇</router-link>
      <router-link class="nav-link" to="/about">정보</router-link>
    </nav>
  </header>
</template>