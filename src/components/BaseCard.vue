<script setup lang="ts">
interface Props {
  description: string
}

const props = defineProps<Props>()
</script>

<template>
  <div class="card">
    <!-- ❌ title ไม่มีใน Props -->
    <p>{{ props.description }}</p>
  </div>
</template>
