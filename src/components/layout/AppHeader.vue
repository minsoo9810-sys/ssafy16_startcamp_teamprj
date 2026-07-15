<!-- filepath: d:\teamprj_startcamp\src\components\layout\AppHeader.vue -->
<template>
  <header class="app-header">
    <router-link class="brand" to="/">LocalHub</router-link>

    <nav class="nav">
      <router-link to="/explore">탐색</router-link>
      <router-link to="/map">지도</router-link>
      <router-link to="/courses">코스</router-link>
      <router-link to="/events">행사</router-link>
      <router-link to="/chatbot">챗봇</router-link>
      <router-link to="/about">정보</router-link>
    </nav>
  </header>
</template>