import { defineStore } from 'pinia'
import DiceRollModal from '~/components/ui/DiceRollModal.vue'
import type { ContextMenuItem, DiceRollModalArgs } from '~/types'

/**
 * Store for managing UI state like modals and context menus
 */
export const useUIStore = defineStore('ui', () => {
  const modal = useModal()

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

  /**
   * Opens the dice roll modal with the given arguments
   * @param args The arguments for the dice roll modal
   */
  function openDiceRollModal(args: DiceRollModalArgs) {
    diceRollModal.args = args
    diceRollModal.isOpen = true
    modal.open(DiceRollModal, {
      title: args.title,
      subtitle: args.subtitle,
      difficultyClass: args.difficultyClass,
      diceType: args.diceType,
      onSuccess: args.onSuccess,
      onFailure: args.onFailure,
      onClose: () => {
        modal.close()
        diceRollModal.isOpen = false
        diceRollModal.args = undefined
      },
    })
  }

  /**
   * Closes the dice roll modal
   */
  function closeDiceRollModal() {
    diceRollModal.isOpen = false
    diceRollModal.args = undefined
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

  return {
    // State
    contextMenu,
    diceRollModal,
    // Actions
    openDiceRollModal,
    closeDiceRollModal,
    setContextMenuItems,
    handleContextMenuOpen,
  }
})
