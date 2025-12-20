<script setup lang="ts">
interface Props {
  /**
   * Size of the spinner in pixels
   * @default 48
   */
  size?: number
  /**
   * Width of the spinner stroke
   * @default 4
   */
  strokeWidth?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 48,
  strokeWidth: 4,
})

// Calculate circle properties
const center = computed(() => props.size / 2)
const radius = computed(() => (props.size - props.strokeWidth) / 2)
</script>

<template>
  <div class="relative" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg
      class="animate-spin"
      :width="size"
      :height="size"
    >
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        :stroke-width="strokeWidth"
        stroke="currentColor"
        fill="none"
        class="text-gold-500 opacity-20"
      />
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        :stroke-width="strokeWidth"
        stroke="currentColor"
        fill="none"
        class="text-gold-500"
        stroke-linecap="round"
        stroke-dasharray="80, 200"
      />
    </svg>
  </div>
</template>
