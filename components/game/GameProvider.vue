<script setup lang="ts">
import { createGameState } from '~/composables/game/useGameState'
import '@tresjs/leches/styles'

const { init } = createGameState()

await init()
</script>

<template>
  <div>
    <slot></slot>
  </div>
</template>
