import { defineStore } from 'pinia'
import DiceRollModal from '~/components/ui/DiceRollModal.vue'
import type { ContextMenuItem, DiceRollModalArgs, Lobby, Player } from '~/shared/types'
import { useMultiplayer } from '~/composables/game/useMultiplayer'
import { useUserStore } from '~/stores/useUserStore'
import { useLobbyStore } from '~/stores/useLobbyStore'
import { calculateSkillCheckModifiers } from '~/utils/dice'
import type { ModalProps } from '@vueuse/core'
import type { DiceRollProps } from '~/components/ui/DiceRollModal.vue'

/**
 * Store for managing UI state like modals and context menus
 */
export const useUIStore = defineStore('ui', () => {
  const modal = useModal()
  const gameStore = useGameStore()
  const userStore = useUserStore()
  const lobbyStore = useLobbyStore()
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
    initiatorId: null as string | null,
  })

  // Track the current remote roll state
  const remoteRoll = ref<{
    result: number
    success: boolean
    isCriticalSuccess: boolean
    isCriticalFailure: boolean
  } | null>(null)

  // Confetti explosion state
  const showConfetti = ref(false)

  /**
   * Triggers the confetti explosion animation
   * @param duration Optional duration in ms after which to hide the confetti (defaults to 2000ms)
   */
  function triggerConfetti(duration: number = 2000) {
    showConfetti.value = true

    // Automatically hide confetti after the specified duration
    setTimeout(() => {
      showConfetti.value = false
    }, duration)
  }

  /**
   * Manually hides the confetti explosion
   */
  function hideConfetti() {
    showConfetti.value = false
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

    // Calculate modifiers if this is a skill check and we're the initiator
    let modifiers = args.modifiers
    if (sync && args.skillCheck) {
      let currentPlayer = null

      // Get current player based on game mode
      if (isMultiplayer.value) {
        // Multiplayer: Get player from lobby
        const currentLobbyId = lobbyStore.currentLobbyId
        currentPlayer = currentLobbyId
          ? (lobbyStore.lobbies[currentLobbyId] as Lobby)?.players?.find((p: Player) => p.id === userStore.userId)
          : null
      }
      else {
        // Single player: Get first player from game store
        currentPlayer = gameStore.players[0]
      }

      if (!currentPlayer?.character) {
        console.warn('No character selected')
        return
      }

      // Get character data from templates
      const characterTemplate = gameStore.characterTemplates.find(
        tmpl => tmpl.key === currentPlayer.character,
      )

      if (characterTemplate) {
        modifiers = calculateSkillCheckModifiers(
          {
            stats: characterTemplate.stats,
            level: 1, // TODO: Get actual character level when implemented
            proficiencies: characterTemplate.classData?.proficiencies?.skills?.from ?? [],
          },
          args.skillCheck.skill,
        )
      }
    }

    // Sync with other players if needed
    if (sync && isMultiplayer.value) {
      sendMsg({
        type: 'DICE_ROLL_START',
        modalArgs: {
          ...args,
          modifiers, // Send calculated modifiers to other players
        },
        playerId: userStore.userId,
        playerName: userStore.username,
      })
    }

    // Update modal props interface to include remoteRoll
    type DiceRollModalProps = DiceRollProps & ModalProps

    modal.open<DiceRollModalProps>(DiceRollModal, {
      title: args.title,
      subtitle: args.subtitle,
      difficultyClass: args.difficultyClass,
      diceType: args.diceType,
      modifiers,
      remoteRoll: remoteRoll.value === null ? undefined : remoteRoll.value,
      isInitiator: sync || !isMultiplayer.value,
      isHost: lobbyStore.isCurrentPlayerHost,
      onResult: (result: DiceRollProps['result']) => {
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
        modal.reset()
        closeDiceRollModal(sync)
      },
    })
  }

  /**
   * Closes the dice roll modal
   */
  function closeDiceRollModal(sync: boolean = true) {
    modal.reset()
    diceRollModal.isOpen = false
    diceRollModal.args = undefined
    diceRollModal.initiatorId = null
    remoteRoll.value = null

    // Sync with other players if needed
    if (isMultiplayer.value && sync) {
      sendMsg({
        type: 'DICE_ROLL_CLOSE',
        playerId: userStore.userId,
      })
    }
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
        diceRollModal.initiatorId = data.playerId // Set the initiator ID
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

        // Update remoteRoll ref directly instead of using modal.patch
        modal.patch({
          remoteRoll: newRemoteRoll,
          isInitiator: data.playerId === diceRollModal.initiatorId,
        })

        // Re-open modal with new remote roll if it's not already open
        if (!diceRollModal.isOpen && diceRollModal.args) {
          openDiceRollModal(diceRollModal.args, false)
        }
      }
    }
    else if (data.type === 'DICE_ROLL_CLOSE') {
      // Only close modal if we're not the initiator
      if (data.playerId !== userStore.userId) {
        closeDiceRollModal(false)
      }
    }
  })

  return {
    // State
    contextMenu,
    diceRollModal,
    remoteRoll,
    showConfetti,
    // Actions
    openDiceRollModal,
    closeDiceRollModal,
    setContextMenuItems,
    handleContextMenuOpen,
    triggerConfetti,
    hideConfetti,
  }
})
