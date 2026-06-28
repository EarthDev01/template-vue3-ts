<script setup lang="ts">
import { onMounted } from 'vue'

const apiKey = import.meta.env.VITE_API_KEY
const getApiKey = () => {
  console.log(apiKey)
}

onMounted(() => {
  getApiKey()
})
</script>

<template>
  <h1>You did its! s</h1>
  <p>
    Visit <a
      href="https://vuejs.org/"
      target="_blank"
      rel="noopener"
    >vuejs.org</a> to read the
    documentation
  </p>
</template>

<style scoped></style>
