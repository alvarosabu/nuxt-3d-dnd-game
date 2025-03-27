<script setup lang="ts">
import type { AnimationAction, Object3D } from 'three'

const { nodes, animations } = await useGLTF('/models/characters/paladin/Paladin_with_Helmet.glb')

const model = nodes.Rig

// const handSlotR = findBoneByName(model, 'handslotr')

const modelRef = ref<Object3D>()
// const animationGroup = ref<AnimationObjectGroup>(new AnimationObjectGroup())
const actions = ref<AnimationAction[]>()
const currentAction = ref<AnimationAction>()

const { actions: animActions } = useAnimations(animations, model)
actions.value = animActions
currentAction.value = animActions.Idle
currentAction.value.play()
</script>

<template>
  <primitive ref="modelRef" name="model" :object="model" />
</template>
