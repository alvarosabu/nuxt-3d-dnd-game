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

    // Initialize avatar on store creation
    updateAvatar()

    return {
      // State
      userId,
      username,
      avatar,
      isEditingUsername,
      // Actions
      setUsername,
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
