<script setup lang="ts">
import { ref, watch } from 'vue'
import { useOutlinedObjects } from '~/composables/useOutlinedObjects'
import CameraControls from '~/components/game/CameraControls.vue'
import World from '~/components/game/World.vue'

// Initialize outline objects composable
const { outlinedObjects } = useOutlinedObjects()


// const { sendMsg } = useMultiplayer(gameStore.isMultiplayer)


const outlineState = reactive({
  edgeStrength: 2000,
  pulseSpeed: 0,
  visibleEdgeColor: '#FFFF00',
  blur: false,
  kernelSize: 3,
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
    <!-- Camera Controls -->
    <CameraControls />

    <World />
    <!-- Postprocessing -->
    <Suspense>
      <EffectComposerPmndrs>
        <OutlinePmndrs
          :outlined-objects="outlinedObjects"
          :blur="outlineState.blur"
          :edge-strength="outlineState.edgeStrength"
          :pulse-speed="outlineState.pulseSpeed"
          :visible-edge-color="outlineState.visibleEdgeColor"
          :kernel-size="outlineState.kernelSize"
        />
      </EffectComposerPmndrs>
    </Suspense>
    
  </TresCanvas>
</template>

<style>
@import '~/assets/css/cursors.css';
</style>
