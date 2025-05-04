
/**
 * Calculates the total hit points for a character based on their class, level, and constitution
 * @param character - The character object
 * @param characterTemplate - The character's class template
 * @param level - The character's current level
 * @param constitutionModifier - The character's constitution modifier
 * @returns The total hit points
 */
export function calculateHitPoints(
  baseHitPoints: number,
  hpPerLevel: number,
  level: number = 1,
  constitutionModifier: number = 0,
): number {

  // Constitution bonus per level
  const constitutionBonus = constitutionModifier * level

  // Calculate total HP
  // Base HP + (HP per level * (level - 1)) + Constitution bonus
  return baseHitPoints + (hpPerLevel * (level - 1)) + constitutionBonus
}

/**
 * Calculates the constitution modifier based on the constitution score
 * @param constitutionScore - The character's constitution score
 * @returns The constitution modifier
 */
export function calculateConstitutionModifier(constitutionScore: number): number {
  return Math.floor((constitutionScore - 10) / 2)
}

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

/**
 * Calculates the proficiency bonus based on character level
 * @param level - The character's level
 * @returns The proficiency bonus
 */
export function calculateProficiencyBonus(level: number): number {
  return Math.floor((level - 1) / 4) + 2
}

/**
 * Calculates the spell save DC for a character
 * @param spellCastingAbility - The character's spellcasting ability score
 * @param proficiencyBonus - The character's proficiency bonus
 * @returns The spell save DC
 */
export function calculateSpellSaveDC(
  spellCastingAbility: number,
  proficiencyBonus: number,
): number {
  return 8 + Math.floor((spellCastingAbility - 10) / 2) + proficiencyBonus
}

/**
 * Calculates the spell attack bonus for a character
 * @param spellCastingAbility - The character's spellcasting ability score
 * @param proficiencyBonus - The character's proficiency bonus
 * @returns The spell attack bonus
 */
export function calculateSpellAttackBonus(
  spellCastingAbility: number,
  proficiencyBonus: number,
): number {
  return Math.floor((spellCastingAbility - 10) / 2) + proficiencyBonus
} 