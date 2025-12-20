<script setup lang="ts">
const isDev = import.meta.dev

useControls('fpsgraph')

</script>

<template>
  <TresLeches v-if="isDev" />
</template>