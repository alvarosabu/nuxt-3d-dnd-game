<script setup lang="ts">
const gameStore = useGameStore()
const { currentLevel } = storeToRefs(gameStore)
</script>
<template>
  <!-- Level Items -->
  <template v-if="gameStore.currentLevel">
    <template v-for="item in gameStore.currentLevel.items" :key="item.id">
      <Item :id="item.id" />
    </template>
  </template>
</template>