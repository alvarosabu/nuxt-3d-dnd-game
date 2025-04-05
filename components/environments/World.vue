<script setup lang="ts">
import { dungeonScene, getNode as getNodeDungeon } from '~/assets/models/world/dungeon.gltf.js'
import { getNode as getNodeLights, lightsScene } from '~/assets/models/world/lights.gltf.js'
import { chestsScene, getNode as getNodeChests } from '~/assets/models/world/chests.gltf.js'
import { doorsScene, getNode as getNodeDoors } from '~/assets/models/world/doors.gltf.js'
import { getNode as getNodeSpikes, spikesScene } from '~/assets/models/world/spikes.gltf.js'
import { getNode as getNodeVisual_blocker, visual_blockerScene } from '~/assets/models/world/visual_blocker.gltf.js'
import { shallowRef, watch } from 'vue'
import type { Group } from 'three'

const modelgetNodeDungeon = await getNodeDungeon(dungeonScene)
const modelgetNodeLights = await getNodeLights(lightsScene)
const modelgetNodeChests = await getNodeChests(chestsScene)
const modelgetNodeDoors = await getNodeDoors(doorsScene)
const modelgetNodeSpikes = await getNodeSpikes(spikesScene)
const modelgetNodeVisual_blocker = await getNodeVisual_blocker(visual_blockerScene)

const groupWrapperRef = shallowRef()

const { stop } = watch(groupWrapperRef, (newValue: Group | undefined) => {
  if (!newValue) {
    return
  }

  // Add all models to one group - just for demonstration purposes //TODO refactor later
  newValue.add(modelgetNodeDungeon)
  newValue.add(modelgetNodeLights)
  newValue.add(modelgetNodeChests)
  newValue.add(modelgetNodeDoors)
  newValue.add(modelgetNodeSpikes)
  newValue.add(modelgetNodeVisual_blocker)

  // Hide the visual blocker for the starting room for now - just for demonstration purposes //TODO refactor later
  const rooms = newValue.children.filter(child => child.name.startsWith('room1'))
  rooms.forEach((room) => {
    room.visible = false
  })

  stop()
})
</script>

<template>
  <TresGroup
    ref="groupWrapperRef"
  />
</template>

<style scoped>
</style>
