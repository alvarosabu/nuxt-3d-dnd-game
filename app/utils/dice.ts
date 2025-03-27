/**
 * Types for dice roll calculations
 */

/**
 * Represents the possible dice types in the game
 */
export type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20'

/**
 * Represents the ability scores for a character
 */
export interface AbilityScores {
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

/**
 * Represents a skill proficiency
 */
export interface SkillProficiency {
  name: string
  ability: keyof AbilityScores
  proficient: boolean
}

/**
 * Calculate the modifier for an ability score
 * @param score The ability score value (1-20)
 * @returns The calculated modifier (-5 to +5)
 */
export function calculateAbilityModifier(score: number): number {
  // Following D&D 5e rules: (score - 10) / 2, rounded down
  return Math.floor((score - 10) / 2)
}

/**
 * Calculate the proficiency bonus based on character level
 * @param level Character level (1-20)
 * @returns The proficiency bonus
 */
export function calculateProficiencyBonus(level: number): number {
  // Following D&D 5e rules: 2 + ((level - 1) / 4), rounded down
  return Math.floor(2 + ((level - 1) / 4))
}

/**
 * Calculate the total modifier for an ability check or saving throw
 * @param abilityScore The ability score value
 * @param isProficient Whether the character is proficient in this ability
 * @param level Character level
 * @param additionalModifiers Any additional modifiers to add
 * @returns The total modifier for the roll
 */
export function calculateTotalModifier(
  abilityScore: number,
  isProficient: boolean,
  level: number,
  additionalModifiers: number = 0,
): number {
  const abilityModifier = calculateAbilityModifier(abilityScore)
  const proficiencyBonus = isProficient ? calculateProficiencyBonus(level) : 0

  return abilityModifier + proficiencyBonus + additionalModifiers
}

/**
 * Calculate the difficulty class (DC) for a saving throw
 * @param spellcastingAbility The spellcasting ability score
 * @param level Character level
 * @param additionalModifiers Any additional modifiers to the DC
 * @returns The calculated DC
 */
export function calculateSpellSaveDC(
  spellcastingAbility: number,
  level: number,
  additionalModifiers: number = 0,
): number {
  // Base DC of 8 + proficiency bonus + spellcasting ability modifier
  const proficiencyBonus = calculateProficiencyBonus(level)
  const abilityModifier = calculateAbilityModifier(spellcastingAbility)

  return 8 + proficiencyBonus + abilityModifier + additionalModifiers
}

/**
 * Calculate advantage/disadvantage for a roll
 * @param hasAdvantage Whether the roll has advantage
 * @param hasDisadvantage Whether the roll has disadvantage
 * @returns Whether the roll should use advantage, disadvantage, or neither
 */
export function calculateAdvantageState(
  hasAdvantage: boolean,
  hasDisadvantage: boolean,
): 'advantage' | 'disadvantage' | 'normal' {
  // If both advantage and disadvantage are present, they cancel out
  if (hasAdvantage && hasDisadvantage) {
    return 'normal'
  }

  if (hasAdvantage) {
    return 'advantage'
  }

  if (hasDisadvantage) {
    return 'disadvantage'
  }

  return 'normal'
}

/**
 * Check if a roll is a critical success or failure
 * @param roll The d20 roll result
 * @returns Object indicating critical success/failure
 */
export function checkCritical(roll: number): { isCriticalSuccess: boolean, isCriticalFailure: boolean } {
  return {
    isCriticalSuccess: roll === 20,
    isCriticalFailure: roll === 1,
  }
}

/**
 * Calculate skill check modifiers for a character
 * @param character The character performing the check
 * @param skill The skill being used (e.g., 'sleightOfHand')
 * @returns Array of modifiers with descriptions
 */
export interface SkillCheckModifier {
  value: number
  source: string
  type: 'ability' | 'proficiency' | 'bonus' | 'penalty'
}

export interface CharacterStats {
  str: number
  dex: number
  con: number
  int: number
  wis: number
  cha: number
}

export function calculateSkillCheckModifiers(
  character: {
    stats: CharacterStats
    level?: number
    proficiencies?: string[]
  },
  skill: string,
): { name: string, value: number, icon?: string }[] {
  const modifiers: { name: string, value: number, icon?: string }[] = []

  /**
   * Normalize skill name to kebab-case format
   * @param skillName The skill name in any format
   * @returns The normalized skill name
   */
  function normalizeSkillName(skillName: string): string {
    // Handle camelCase
    const deCamelCased = skillName.replace(/([a-z])([A-Z])/g, '$1-$2')
    return deCamelCased
      .toLowerCase()
      // Replace spaces and underscores with hyphens
      .replace(/[\s_]+/g, '-')
      // Remove any special characters
      .replace(/['"]/g, '')
  }

  // Map skills to their ability scores and stats properties with both formats
  const skillAbilityMap: Record<string, keyof CharacterStats> = {
    // Dexterity based skills
    'sleight-of-hand': 'dex',
    'sleightofhand': 'dex',
    'stealth': 'dex',
    'acrobatics': 'dex',
    // Strength based skills
    'athletics': 'str',
    // Intelligence based skills
    'arcana': 'int',
    'history': 'int',
    'investigation': 'int',
    'nature': 'int',
    'religion': 'int',
    // Wisdom based skills
    'animal-handling': 'wis',
    'animalhandling': 'wis',
    'insight': 'wis',
    'medicine': 'wis',
    'perception': 'wis',
    'survival': 'wis',
    // Charisma based skills
    'deception': 'cha',
    'intimidation': 'cha',
    'performance': 'cha',
    'persuasion': 'cha',
  }

  // Normalize the input skill name
  const normalizedSkill = normalizeSkillName(skill)
  // Also try without hyphens for more flexible matching
  const normalizedSkillNoHyphens = normalizedSkill.replace(/-/g, '')

  // Get the ability score for this skill
  const ability = skillAbilityMap[normalizedSkill] || skillAbilityMap[normalizedSkillNoHyphens]

  if (!ability) {
    console.warn(`Unknown skill: ${skill}. 
    Normalized as: ${normalizedSkill} or ${normalizedSkillNoHyphens}
    Available skills: ${Object.keys(skillAbilityMap)
      .filter(k => !k.includes('ofhand') && !k.includes('handling')) // Filter out duplicate entries
      .map(s => s.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '))
      .join(', ')}
    `)
    return []
  }

  // Add ability modifier only if it's not zero
  const abilityMod = calculateAbilityModifier(character.stats[ability])
  if (abilityMod !== 0) {
    modifiers.push({
      name: ability.toUpperCase(),
      value: abilityMod,
      icon: `i-game-${ability.toLowerCase()}`,
    })
  }

  // Check proficiency - normalize both the skill name and proficiencies
  const isProficient = character.proficiencies?.some((p) => {
    const normalizedProf = normalizeSkillName(p)
    const normalizedProfNoHyphens = normalizedProf.replace(/-/g, '')
    return normalizedProf === normalizedSkill || normalizedProfNoHyphens === normalizedSkillNoHyphens
  }) ?? false

  if (isProficient) {
    const profBonus = calculateProficiencyBonus(character.level ?? 1)
    // Only add proficiency bonus if it's not zero
    if (profBonus !== 0) {
      modifiers.push({
        name: 'Proficiency',
        value: profBonus,
        icon: 'i-game-proficiency',
      })
    }
  }

  return modifiers
}
