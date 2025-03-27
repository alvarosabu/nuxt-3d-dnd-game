export const useLoading = () => {
  const progress = ref(0)
  const message = ref('Loading...')
  const isLoading = ref(true)

  const setProgress = (value: number, newMessage?: string) => {
    progress.value = value
    if (newMessage) {
      message.value = newMessage
    }
    if (value >= 100) {
      // Add a small delay before hiding the loading screen
      setTimeout(() => {
        isLoading.value = false
      }, 500)
    }
  }

  return {
    progress: readonly(progress),
    message: readonly(message),
    isLoading: readonly(isLoading),
    setProgress,
  }
}
