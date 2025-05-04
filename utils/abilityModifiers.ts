/**
 * Calculates all ability modifiers for a character
 * @param stats - The character's ability scores
 * @returns An object containing all ability modifiers
 */
export function calculateAbilityModifiers(stats: {
  str: number
  dex: number
  con: number
  int: number
  wis: number
  cha: number
}) {
  return {
    strength: Math.floor((stats.str - 10) / 2),
    dexterity: Math.floor((stats.dex - 10) / 2),
    constitution: Math.floor((stats.con - 10) / 2),
    intelligence: Math.floor((stats.int - 10) / 2),
    wisdom: Math.floor((stats.wis - 10) / 2),
    charisma: Math.floor((stats.cha - 10) / 2),
  }
} 