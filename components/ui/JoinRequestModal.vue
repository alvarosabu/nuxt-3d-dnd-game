<script setup lang="ts">
defineProps<{
  pendingJoinRequest: {
    player: {
      name: string
    }
  }
}>()

const emit = defineEmits(['success', 'close'])
const modal = useModal()

function onSuccess() {
  emit('success')
  modal.close()
}

function onClose() {
  emit('close')
  modal.close()
}
</script>

<template>
  <UModal title="Join Request">
    <template #body>
      <p>
        {{ pendingJoinRequest?.player.name }} wants to join your session.
      </p>
    </template>
    <template #footer>
      <div class="flex gap-2">
        <UButton color="neutral" label="Close" @click="onClose" />
        <UButton label="Accept" @click="onSuccess" />
      </div>
    </template>
  </UModal>
</template>
