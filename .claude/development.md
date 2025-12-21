# Development Guide

## Commands

```bash
# Development
pnpm dev              # Start development server
pnpm dev --host       # Start dev server exposed on network

# Build & Preview
pnpm build            # Build for production
node .output/server/index.mjs  # Serve built project locally

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Auto-fix ESLint issues
```

## Common Development Patterns

### 1. Data Loading
Use `queryCollection()` to load static game data:

```typescript
const races = await queryCollection('races').all()
```

Available collections:
- `origins`, `races`, `classes`, `spells`, `cantrips`
- `levels`, `features`, `abilities`, `feats`
- `passives`, `progressions`, `subclasses`

### 2. Character Stats Calculations
**Always** use utility functions from `app/utils/`:

```typescript
import { calculateHitPoints, calculateAbilityModifiers } from '~/utils/characterStats'

const modifiers = calculateAbilityModifiers(stats)
const maxHP = calculateHitPoints(baseHP, hpPerLevel, level, modifiers.constitution)
```

Never calculate stats manually - centralized utils ensure consistency with D&D 5e rules.

### 3. Store Access
Access stores via composables:

```typescript
const gameStore = useGameStore()
const { characters, activeCharacter } = storeToRefs(gameStore)

// Methods are not refs
gameStore.addCharacter(character)
```

### 4. Type Safety
Import types from central location:

```typescript
import type { Character, GameItem, Level } from '~/types'
```

Use type guards when needed:

```typescript
if (item.type === 'chest') {
  // TypeScript knows this is ChestItem
  console.log(item.state.isLocked)
}
```

### 5. 3D Component Structure
TresJS components use declarative syntax:

```vue
<template>
  <TresCanvas>
    <TresPerspectiveCamera :position="[0, 5, 10]" />
    <TresAmbientLight :intensity="0.5" />
    <TresMesh>
      <TresBoxGeometry :args="[1, 1, 1]" />
      <TresMeshStandardMaterial color="orange" />
    </TresMesh>
  </TresCanvas>
</template>
```

Access Three.js instances via template refs when needed:

```vue
<script setup>
const meshRef = ref()

watch(meshRef, (mesh) => {
  if (mesh) {
    // Direct Three.js access
    mesh.rotation.y = Math.PI / 4
  }
})
</script>

<template>
  <TresMesh ref="meshRef">
    <!-- ... -->
  </TresMesh>
</template>
```

## Testing the Project

### Local Development
1. Start dev server: `pnpm dev`
2. Open `http://localhost:3000`
3. For multiplayer testing:
   - Run `pnpm dev --host`
   - Access from multiple devices on network

### Production Testing
1. Build: `pnpm build`
2. Serve: `node .output/server/index.mjs`
3. Open `http://localhost:3000`

## Debugging

### Debug Mode
The game has a debug mode controlled by Leches:

```typescript
const { debug } = useControls({ debug: true })
```

When enabled, additional debug UI and controls are shown.

### Browser DevTools
- Vue DevTools for component/store inspection
- Three.js Inspector browser extension for 3D scene debugging
- Network tab for WebSocket message inspection

## Common Tasks

### Adding a New Character Template
1. Create JSON file in `content/origins/`
2. Ensure it matches `CharacterTemplate` type
3. Reference existing race (from `content/races/`)
4. Reference existing class (from `content/classes/`)
5. Templates auto-load via `loadCharacterTemplates()`

### Adding a New Game Item Type
1. Add type to `GameItem` type union in `app/types/index.ts`
2. Create specific interface extending `GameItem`
3. Add to level JSON in `content/levels/`
4. Create Vue component in `app/components/game/`
5. Handle in game scene

### Modifying Character Stats Logic
1. Update utility function in `app/utils/characterStats.ts`
2. Ensure all callers use the updated function
3. Check impact on:
   - Character creation (`addCharacter`)
   - Character leveling (`levelUpCharacter`)
   - Stat updates (`updateCharacterStats`)

### Adding WebSocket Message Type
1. Add message type constant
2. Update server handler in `server/api/websocket.ts`
3. Update client handler in `app/composables/game/useMultiplayer.ts`
4. Update relevant stores to handle new message

## Deployment

Deployed on Fly.io: https://nuxt-3d-dnd-game.fly.dev/

Build configuration in `Dockerfile` (managed by `@flydotio/dockerfile`).
