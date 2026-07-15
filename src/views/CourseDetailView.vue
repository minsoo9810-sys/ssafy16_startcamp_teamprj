<!-- filepath: d:\teamprj_startcamp\src\views\CourseDetailView.vue -->
<template>
  <section class="page">
    <h1>코스 상세</h1>
    <p>현재 코스 ID: {{ route.params.id }}</p>
  </section>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>