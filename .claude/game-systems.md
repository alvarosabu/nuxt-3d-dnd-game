# Core Game Systems

## Character System

Located in `useGameStore` (`app/stores/useGameStore.ts`)

### Character Creation
`addCharacter()` merges template + custom stats:
1. Finds character template by key
2. Merges base stats with custom stats
3. Calculates ability modifiers using D&D 5e formula: `Math.floor((ability - 10) / 2)`
4. Calculates max HP using constitution modifier
5. Creates new character instance with UUID

### Character Progression
`levelUpCharacter()` handles leveling:
- Increases character level
- Recalculates max HP based on new level
- Restores HP to max on level up

### Stat Updates
`updateCharacterStats()` recalculates when stats change:
- Recalculates all ability modifiers
- Only recalculates HP if constitution modifier changed
- Adjusts current HP proportionally to max HP changes

### HP Calculation (D&D 5e Rules)

```
HP = baseHitPoints + (hpPerLevel × (level - 1)) + (CON modifier × level)
```

**Important**: Constitution modifier applies to EVERY level, not just current level.

Example: Level 5 character with CON 14 (+2 modifier)
- Base HP: 10
- HP per level: 6
- Total: 10 + (6 × 4) + (2 × 5) = 44 HP

## Item System

Located in `useGameStore`

### Item Storage
Items stored as `Record<id, GameItem>` for:
- Efficient O(1) lookups by ID
- Easy persistence to session storage
- Simple sync with multiplayer

### Item Properties
```typescript
interface GameItem {
  id: string
  type: 'chest' | 'door' // extensible
  position: [number, number, number]
  rotation?: [number, number, number]
  state: Record<string, unknown> // arbitrary state
}
```

### Level Items
- Each level defines initial item placements
- `setCurrentLevel()` clears and reinitializes items
- Items can be added/updated/removed during gameplay
- Level-specific items are synchronized with global items state

### Multiplayer Sync
`handleRemoteItemUpdate()` synchronizes item changes:
- Updates global items state
- Updates items in current level
- Handles both state and position updates

## Multiplayer System

### Architecture
- **Client**: `useMultiplayer` composable (`app/composables/game/useMultiplayer.ts`)
- **Server**: WebSocket handler (`server/api/websocket.ts`)
- **Pattern**: Shared composable ensures single WebSocket instance per client

### WebSocket Message Types

```typescript
// Connection
CONNECTION_ESTABLISHED     // Server → Client: Provides peer ID
PLAYER_CONNECTION_REQUEST  // Client → Server: Join with user info
PLAYER_CONNECTION_RESPONSE // Server → Client: Connection confirmed
PLAYER_DISCONNECTED        // Server → Client: Player left

// State Sync
SYNC_STATE                 // Server → Client: Full state sync (lobbies)
ITEM_STATE_UPDATE          // Client ↔ Server: Item state changed
```

### State Synchronization
- WebSocket data watched via Vue `watch()`
- Store mutations triggered by incoming messages
- Ensures UI reactivity to remote changes

### Connection Flow
1. WebSocket connects on mount
2. Server sends `CONNECTION_ESTABLISHED` with peer ID
3. Client stores peer ID in `useUserStore`
4. Client sends `PLAYER_CONNECTION_REQUEST` with user info
5. Server confirms with `PLAYER_CONNECTION_RESPONSE`
6. Client sets `isConnected = true`

### Item Sync Pattern
When item state changes locally:
1. Update local store
2. Send `ITEM_STATE_UPDATE` to server
3. Server broadcasts to other clients
4. Other clients call `handleRemoteItemUpdate()`

## Data Loading

### Static Content Loading
Use Nuxt Content `queryCollection()`:

```typescript
const templates = await queryCollection('origins').all()
const races = await queryCollection('races').all()
```

### Data Joining Pattern
Create lookup maps for efficient joins:

```typescript
const raceMap = new Map(races.map(race => [race.slug, race]))
const classMap = new Map(classes.map(cls => [cls.slug, cls]))

templates.map(tmpl => ({
  ...tmpl,
  raceData: raceMap.get(tmpl.race),
  classData: classMap.get(tmpl.class)
}))
```

This pattern appears in `loadCharacterTemplates()`.

## Store Persistence

`useGameStore` uses session storage via `pinia-plugin-persistedstate`:
- Players persist across page reloads
- Characters persist (including custom characters)
- Items persist (including state changes)
- Current level persists

Note: WebSocket connections do NOT persist - must reconnect on page reload.
