<script setup lang="ts">
defineProps<{
  pendingJoinRequest: {
    player: {
      name: string
    }
  }
}>()

const emit = defineEmits(['accept', 'reject'])
const modal = useModal()

function onAccept() {
  emit('accept')
  modal.close()
}

function onReject() {
  emit('reject')
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
        <UButton color="neutral" label="Reject" @click="onReject" />
        <UButton label="Accept" @click="onAccept" />
      </div>
    </template>
  </UModal>
</template>
