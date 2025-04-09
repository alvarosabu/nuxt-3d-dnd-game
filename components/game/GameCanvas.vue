<script setup lang="ts">
import { useMultiplayer } from '~/composables/game/useMultiplayer'
import type { ThreeEvent } from '@tresjs/core'
import { computed, ref, shallowRef, watch } from 'vue'
import { useOutlinedObjects } from '~/composables/useOutlinedObjects'
import { KernelSize } from 'postprocessing'
import Item from '~/components/game/Item.vue'
import World from '~/components/environments/World.vue'

const userStore = useUserStore()
const lobbyStore = useLobbyStore()
const gameStore = useGameStore()
const { currentLobbyPlayers } = storeToRefs(lobbyStore)

// Initialize outline objects composable
const { outlinedObjects } = useOutlinedObjects()

// Compute characters based on game mode
const characters = computed(() => {
  if (gameStore.isMultiplayer) {
    return currentLobbyPlayers.value
  }
  return gameStore.players
})

const { sendMsg } = useMultiplayer(gameStore.isMultiplayer)
const orbitControlsRef = ref()


useControls('fpsgraph')

const { edgeStrength, pulseSpeed, visibleEdgeColor, blur } = useControls({
  edgeStrength: 2000,
  pulseSpeed: {
    value: 0,
    min: 0,
    max: 2,
    step: 0.01,
  },
  visibleEdgeColor: '#FFFF00',
  blur: false,
  kernelSize: {
    value: 3,
    min: KernelSize.VERY_SMALL,
    max: KernelSize.VERY_LARGE,
    step: 1,
  },
})




const outlineRef = ref()

watch(outlineRef, ({ effect }) => {
  effect.blurPass.kernelSize = 4
})

const { cursor } = useGameCursor()

// Temporary
/* gameStore.openDiceRollModal({
  title: 'Dexterity Check',
  subtitle: 'Sleight of Hand',
  difficultyClass: 10,
  diceType: 20,
}) */
</script>

<template>
  <TresCanvas
    clear-color="#080808"
    window-size
    class="cursor-game"
    :class="[`custom-cursor-${cursor}`]"
  >
    <Suspense>
      <Environment preset="sunset" :blur="1" />
    </Suspense>
    <TresPerspectiveCamera
      :position="[11, 11, 11]"
      :look-at="[0, 0, 0]"
      :fov="45"
      :near="0.1"
      :far="1000"
    />

    <OrbitControls
      ref="orbitControlsRef"
      make-default
      :enable-damping="true"
      :damping-factor="0.05"
    />

    <!-- Environment -->
    <TresAmbientLight :intensity="0.5" />
    <TresDirectionalLight :position="[10, 10, 10]" :intensity="1" />

    <TresGridHelper :args="[100, 100]" :position-y="0.001" />

    <Suspense>
      <template v-for="(player, index) in characters" :key="player.id">
        <Character
          :character="player.character"
          :player="player"
          :is-current-player="player.id === userStore.userId"
          :index="index"
        />
      </template>
    </Suspense>
   

    <!-- Level Items -->
    <template v-if="gameStore.currentLevel">
      <template v-for="item in gameStore.currentLevel.items" :key="item.id">
        <Item :id="item.id" />
      </template>
    </template>
    <!-- <TresMesh
      v-if="gameStore.currentLevel"
      :position-y="0.1"
      :rotation-x="-Math.PI / 2"
      :scale="100"
     
    >
      <TresPlaneGeometry />
      <TresMeshBasicMaterial color="red" transparent :opacity="0.2" />
    </TresMesh> -->
    <!-- World -->
    <Suspense>
      <World />
    </Suspense>

    <!-- Postprocessing -->
    <EffectComposerPmndrs>
      <OutlinePmndrs
        ref="outlineRef"
        :outlined-objects="outlinedObjects"
        :blur="blur"
        :edge-strength="edgeStrength"
        :pulse-speed="pulseSpeed"
        :visible-edge-color="visibleEdgeColor"
        :kernel-size="4"
      />
    </EffectComposerPmndrs>
  </TresCanvas>
</template>

<style>
@import '~/assets/css/cursors.css';
</style>
