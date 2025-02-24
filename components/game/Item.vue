<script setup lang="ts">
import Chest from '~/components/items/Chest.vue'
// Props for the item
const props = defineProps<{
  id: string
}>()

// Get item from store
const gameStore = useGameStore()
const item = computed(() => gameStore.getItemById(props.id))
</script>

<template>
  <Suspense>
    <Chest v-if="item?.type === 'chest'" :id="id" />
  </Suspense>
</template>
