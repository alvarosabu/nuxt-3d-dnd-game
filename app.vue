<script lang="ts" setup>
const colorMode = useColorMode()

colorMode.value = 'dark'
</script>

<template>
  <UApp>
    <Suspense>
      <GameProvider>
        <NuxtPage />
      </GameProvider>
    </Suspense>
  </UApp>
</template>
