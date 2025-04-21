<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useOutlinedObjects } from '~/composables/useOutlinedObjects'
import { KernelSize } from 'postprocessing'
import DebugControls from '~/components/ui/DebugControls.vue'
import CameraControls from '~/components/game/CameraControls.vue'
import World from '~/components/game/World.vue'

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

// const { sendMsg } = useMultiplayer(gameStore.isMultiplayer)


const outlineState = reactive({
  edgeStrength: 2000,
  pulseSpeed: 0,
  visibleEdgeColor: '#FFFF00',
  blur: false,
  kernelSize: 3,
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
  <DebugControls />
  <TresCanvas
    clear-color="#080808"
    window-size
    class="cursor-game"
    :class="[`custom-cursor-${cursor}`]"
  >
    <!-- Camera Controls -->
    <CameraControls />

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
    <World />
    <!-- Postprocessing -->
    <EffectComposerPmndrs>
      <OutlinePmndrs
        ref="outlineRef"
        :outlined-objects="outlinedObjects"
        :blur="outlineState.blur"
        :edge-strength="outlineState.edgeStrength"
        :pulse-speed="outlineState.pulseSpeed"
        :visible-edge-color="outlineState.visibleEdgeColor"
        :kernel-size="outlineState.kernelSize"
      />
    </EffectComposerPmndrs>
  </TresCanvas>
</template>

<style>
@import '~/assets/css/cursors.css';
</style>
