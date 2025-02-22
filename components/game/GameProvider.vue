<script setup lang="ts">
import '@tresjs/leches/styles'

const { init } = useGameStore()

await init()
</script>

<template>
  <div>
    <slot></slot>
  </div>
</template>
