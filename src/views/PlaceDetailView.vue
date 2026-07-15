<!-- filepath: d:\teamprj_startcamp\src\views\PlaceDetailView.vue -->
<template>
  <section class="page">
    <h1>관광지 상세</h1>
    <p>현재 상세 페이지의 ID: {{ route.params.id }}</p>
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>