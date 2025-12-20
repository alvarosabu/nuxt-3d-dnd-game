interface UseBufferedLoadingOptions {
  /**
   * Minimum time in milliseconds that the loading screen should be shown
   * @default 5000
   */
  minDisplayTime?: number
  /**
   * Number of steps to show in the loading progress
   * @default 3
   */
  steps?: number
}

export const useBufferedLoading = (options: UseBufferedLoadingOptions = {}) => {
  const {
    minDisplayTime = 5000,
    steps = 3,
  } = options

  const progress = ref(0)
  const isLoading = ref(true)
  const startTime = ref(0)

  // Calculate step size
  const stepSize = 100 / steps

  const setProgress = async (value: number) => {
    // If this is the first progress update, record the start time
    if (progress.value === 0) {
      startTime.value = Date.now()
    }

    progress.value = value

    // If we're at 100%, ensure minimum display time has passed
    if (value >= 100) {
      const elapsedTime = Date.now() - startTime.value
      if (elapsedTime < minDisplayTime) {
        // Wait for the remaining time
        await new Promise(resolve => setTimeout(resolve, minDisplayTime - elapsedTime))
      }
      isLoading.value = false
    }
  }

  // Simulate loading steps
  const simulateLoading = async () => {
    for (let i = 1; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, minDisplayTime / steps))
      await setProgress(i * stepSize)
    }
  }

  return {
    progress: readonly(progress),
    isLoading: readonly(isLoading),
    setProgress,
    simulateLoading,
  }
}
