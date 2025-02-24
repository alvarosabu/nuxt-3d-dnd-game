export type GameCursor = 'default' | 'pointer' | 'locked' | 'unlocked' | 'move'

/**
 * Composable to manage cursor states in the game
 * Uses global state to ensure consistency across components
 * @returns cursor state and methods to control it
 */
export function useGameCursor() {
  const cursor = useState<GameCursor>('game-cursor', () => 'default')

  /**
   * Set the current cursor type
   * @param type - The cursor type to set
   */
  function setCursor(type: GameCursor) {
    cursor.value = type
  }

  /**
   * Reset cursor to default state
   */
  function resetCursor() {
    cursor.value = 'default'
  }

  return {
    cursor,
    setCursor,
    resetCursor,
  }
}
