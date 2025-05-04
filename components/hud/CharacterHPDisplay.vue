<script setup lang="ts">
import type { Character } from '~/types'
import { computed } from 'vue'

/**
 * Displays the current and max HP for a character
 * @prop character - The character object
 * @prop size - The text size: 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'
 * @prop class - Additional classes to extend the root div
 */
const props = defineProps<{
  character: Character,
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl',
  class?: string,
}>()

const sizeMap: Record<string, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl',
}

const textSize = computed(() => sizeMap[props.size ?? 'sm'])
</script>

<template>
  <div :class="['absolute bottom-0 left-0 mx-0 w-full text-white text-center text-shadow-lg', textSize, props.class]">
    {{ character.currentHP }} / {{ character.maxHP }}
  </div>
</template> 