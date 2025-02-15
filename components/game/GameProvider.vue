<script setup lang="ts">
import { createGameState } from '~/composables/game/useGameState'
const { init } = createGameState()

await init()
</script>

<template>
  <div>
    <slot></slot>
  </div>
</template>
