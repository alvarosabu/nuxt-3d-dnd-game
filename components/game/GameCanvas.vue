<script setup lang="ts">
import { useMultiplayer } from '~/composables/game/useMultiplayer'

import DebugCharacter from '~/components/character/DebugCharacter.vue'
import type { Vector3 } from 'three'

const userStore = useUserStore()
const lobbyStore = useLobbyStore()
const { currentLobby, currentLobbyPlayers } = storeToRefs(lobbyStore)
</script>

<template>
  <TresCanvas clear-color="#000000" window-size>
    <Suspense>
      <Environment preset="sunset" :blur="1" background />
    </Suspense>
    <TresPerspectiveCamera
      :position="[20, 20, 20]"
      :look-at="[0, 0, 0]"
      :fov="45"
      :near="0.1"
      :far="1000"
    />

    <OrbitControls />

    <!-- Environment -->
    <TresAmbientLight :intensity="0.5" />
    <TresDirectionalLight :position="[10, 10, 10]" :intensity="1" />

    <TresGridHelper :args="[100, 100]" />
    <Suspense>
      <template v-for="(player, index) in currentLobbyPlayers" :key="player.id">
        <Character
          :player="player"
          :is-current-player="player.id === userStore.userId"
          :index="index"
        />
      </template>
    </Suspense>
  </TresCanvas>
</template>
