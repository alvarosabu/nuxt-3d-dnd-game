import { defineStore } from 'pinia'
import DiceRollModal from '~/components/ui/DiceRollModal.vue'
import type { ContextMenuItem, DiceRollModalArgs } from '~/types'
import { useMultiplayer } from '~/composables/game/useMultiplayer'
import { useUserStore } from '~/stores/useUserStore'

/**
 * Store for managing UI state like modals and context menus
 */
export const useUIStore = defineStore('ui', () => {
  const modal = useModal()
  const gameStore = useGameStore()
  const userStore = useUserStore()
  const isMultiplayer = computed(() => gameStore.isMultiplayer)
  const { sendMsg, data } = useMultiplayer(isMultiplayer.value)
  // Context Menu State
  const contextMenu = reactive({
    enabled: false,
    isOpen: false,
    items: [] as ContextMenuItem[],
  })

  // Dice Roll Modal State
  const diceRollModal = reactive({
    isOpen: false,
    args: undefined as DiceRollModalArgs | undefined,
  })

  // Track the current remote roll state
  const remoteRoll = ref<{
    result: number
    success: boolean
    isCriticalSuccess: boolean
    isCriticalFailure: boolean
  } | null>(null)

  /**
   * Reset all modal state
   */
  function resetModalState() {
    modal.close()
    diceRollModal.isOpen = false
    diceRollModal.args = undefined
    remoteRoll.value = null
    modal.patch({ remoteRoll: undefined })
  }

  /**
   * Opens the dice roll modal with the given arguments and optionally syncs with other players
   * @param args The arguments for the dice roll modal
   * @param sync Whether to sync this action with other players
   */
  function openDiceRollModal(args: DiceRollModalArgs, sync: boolean = true) {
    diceRollModal.args = args
    diceRollModal.isOpen = true
    remoteRoll.value = null // Reset remote roll state

    // Sync with other players if needed
    if (sync && isMultiplayer.value) {
      sendMsg({
        type: 'DICE_ROLL_START',
        modalArgs: args,
        playerId: userStore.userId,
        playerName: userStore.username,
      })
    }

    modal.open(DiceRollModal, {
      title: args.title,
      subtitle: args.subtitle,
      difficultyClass: args.difficultyClass,
      diceType: args.diceType,
      remoteRoll: remoteRoll.value,
      onResult: (result) => {
        // Sync dice roll result with other players
        if (isMultiplayer.value) {
          sendMsg({
            type: 'DICE_ROLL_RESULT',
            ...result,
            playerId: userStore.userId,
            playerName: userStore.username,
          })
        }
      },
      onSuccess: () => {
        if (args.onSuccess) { args.onSuccess() }
      },
      onFailure: () => {
        if (args.onFailure) { args.onFailure() }
      },
      onClose: () => {
        resetModalState()
      },
    })
  }

  /**
   * Closes the dice roll modal
   */
  function closeDiceRollModal() {
    resetModalState()
  }

  /**
   * Sets the context menu items
   * @param items The items to show in the context menu
   */
  function setContextMenuItems(items: ContextMenuItem[]) {
    contextMenu.items = items
  }

  /**
   * Handles the context menu open state change
   * @param open Whether the context menu is open
   */
  function handleContextMenuOpen(open: boolean) {
    contextMenu.isOpen = open

    if (!open) {
      contextMenu.items = []
      contextMenu.enabled = false
    }
  }

  // Watch for remote dice roll events
  watch(data, (newData) => {
    if (!newData) { return }

    const data = JSON.parse(newData)
    if (data.type === 'DICE_ROLL_START') {
      // Only open modal if we're not the initiator
      if (data.playerId !== userStore.userId) {
        // Open dice roll modal for other players
        openDiceRollModal(data.modalArgs, false) // Pass false to prevent infinite loop
      }
    }
    else if (data.type === 'DICE_ROLL_RESULT') {
      // Only handle result if we're not the initiator
      if (data.playerId !== userStore.userId) {
        // Update remote roll state and patch the modal
        const newRemoteRoll = {
          result: data.result,
          success: data.success,
          isCriticalSuccess: data.isCriticalSuccess,
          isCriticalFailure: data.isCriticalFailure,
        }

        // Update the modal with the new remote roll
        modal.patch({
          remoteRoll: newRemoteRoll,
        })

        // Re-open modal with new remote roll if it's not already open
        if (!diceRollModal.isOpen && diceRollModal.args) {
          openDiceRollModal(diceRollModal.args, false)
        }
      }
    }
  })

  return {
    // State
    contextMenu,
    diceRollModal,
    remoteRoll,
    // Actions
    openDiceRollModal,
    closeDiceRollModal,
    setContextMenuItems,
    handleContextMenuOpen,
  }
})
