<script setup lang="ts">
import type { Group } from 'three'

const { getResource } = useResourcePreloader()

const { scene: model_dungeon } = getResource('models', 'dungeon')
const { scene: model_lights } = getResource('models', 'lights')
const { scene: model_chests } = getResource('models', 'chests')
const { scene: model_doors } = getResource('models', 'doors')
const { scene: model_spikes } = getResource('models', 'spikes')
const { scene: model_visual_blocker } = getResource('models', 'visual_blocker')

const model_dungeon_ref = ref()
const model_lights_ref = ref()
const model_chests_ref = ref()
const model_doors_ref = ref()
const model_spikes_ref = ref()
const model_visual_blocker_ref = shallowRef()

// Hide the visual blocker for the starting room for now - just for demonstration purposes
const { stop } = watch(model_visual_blocker_ref, (newValue: Group | undefined) => {
  if (!newValue) {
    return
  }
  const rooms = newValue.children.filter(child => child.name.startsWith('room1'))
  rooms.forEach((room) => {
    room.visible = false
  })
  stop()
})
</script>

<template>
  <primitive
    v-if="model_dungeon"
    ref="model_dungeon_ref"
    :name="model_dungeon"
    :object="model_dungeon"
  />
  <primitive
    v-if="model_lights"
    ref="model_lights_ref"
    :name="model_lights"
    :object="model_lights"
  />
  <primitive
    v-if="model_chests"
    ref="model_chests_ref"
    :name="model_chests"
    :object="model_chests"
  />
  <primitive
    v-if="model_doors"
    ref="model_doors_ref"
    :name="model_doors"
    :object="model_doors"
  />
  <primitive
    v-if="model_spikes"
    ref="model_spikes_ref"
    :name="model_spikes"
    :object="model_spikes"
  />
  <primitive
    v-if="model_visual_blocker"
    ref="model_visual_blocker_ref"
    :name="model_visual_blocker"
    :object="model_visual_blocker"
  />
</template>
