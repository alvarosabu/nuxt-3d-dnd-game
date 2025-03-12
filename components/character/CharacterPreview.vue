<script setup lang="ts">
import type { AnimationAction, Group } from 'three'
import { LoopOnce, Mesh, MeshToonMaterial } from 'three'
import { useResourcePreloader } from '~/composables/useResourcePreloader'
import type { CharacterTemplate } from '~/types'
import { SkeletonUtils } from 'three-stdlib'

interface Props {
  character: CharacterTemplate
  isSelected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false,
})

const actions = ref<AnimationAction[]>()
const currentAction = ref<AnimationAction>()

const { getResource } = useResourcePreloader()

const { scene, animations, materials } = getResource('models', props.character.key)
const clonedScene = SkeletonUtils.clone(scene)

const { nodes } = useGraph(clonedScene)

const model = Object.values(nodes).find(node => node.name.includes('Rig'))

/* model?.traverse((child) => {
  if (child instanceof Mesh) {
    console.log(child.material)
    child.material.roughness = 1
  }
}) */
Object.entries(materials).forEach(([key, material]) => {
  if (!key.includes('metallic')) {
    material.roughness = 1
  }
})
const scale = computed(() => props.isSelected ? 1.2 : 1)

const modelGroup = ref<Group>()

// Apply opacity to the whole model group

const { actions: animActions, mixer } = useAnimations(animations, model)
actions.value = animActions

// Handle animation changes based on selection
watch(() => props.isSelected, (isSelected) => {
  if (!animActions) { return }

  if (isSelected) {
    // Delay the animation to sync with carousel
    setTimeout(() => {
      // Fade out current animation
      currentAction.value?.fadeOut(0.5)

      // Play Cheer animation once
      currentAction.value = animActions.Cheer
      currentAction.value?.reset().fadeIn(0.5).play()
      currentAction.value?.setLoop(LoopOnce, 1)
      currentAction.value.clampWhenFinished = true

      // After animation completes, transition back to Idle
      const onFinished = () => {
        currentAction.value?.fadeOut(0.5)
        currentAction.value = animActions.Idle
        currentAction.value?.reset().fadeIn(0.5).play()
        // Remove the listener
        mixer.removeEventListener('finished', onFinished)
      }

      mixer.addEventListener('finished', onFinished)
    }, 800) // Delay matches roughly when the spring animation settles
  }
  else {
    // When deselected, just go back to Idle
    currentAction.value?.fadeOut(0.5)
    currentAction.value = animActions.Idle
    currentAction.value?.reset().fadeIn(0.5).play()
  }
}, { immediate: true })
</script>

<template>
  <TresGroup
    :scale="[scale, scale, scale]"
  >
    <TresGroup ref="modelGroup">
      <primitive :object="model" />
    </TresGroup>
  </TresGroup>
</template>
