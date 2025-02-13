import { defineStore } from 'pinia'

/**
 * Store to manage user information and persistence
 */
export const useUserStore = defineStore(
  'user',
  () => {
    // State
    const userId = ref(Math.random().toString(36).substring(2, 15))
    const username = ref(`guest-${userId.value}`)
    const avatar = ref('')
    const peerId = ref('')
    const isConnected = ref(false)
    const isEditingUsername = ref(false)

    /**
     * Updates the avatar based on the current username
     */
    const updateAvatar = () => {
      avatar.value = `https://api.dicebear.com/9.x/thumbs/svg?seed=${username.value}`
    }

    /**
     * Updates the username and regenerates the avatar
     * @param newUsername - The new username to set
     */
    const setUsername = (newUsername: string) => {
      username.value = newUsername
      updateAvatar()
    }

    /**
     * Toggles username editing mode
     */
    const toggleEditUsername = () => {
      isEditingUsername.value = !isEditingUsername.value
    }

    const setPeerId = (newPeerId: string) => {
      peerId.value = newPeerId
    }

    const getPeerId = () => {
      return peerId.value
    }

    // Initialize avatar on store creation
    updateAvatar()

    return {
      // State
      userId,
      username,
      avatar,
      isConnected,
      isEditingUsername,
      peerId,
      // Actions
      setUsername,
      setPeerId,
      getPeerId,
      updateAvatar,
      toggleEditUsername,
    }
  },
  {
    persist: {
      storage: piniaPluginPersistedstate.sessionStorage(),
    },
  },
)
