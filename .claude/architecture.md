# Architecture

## Directory Structure

### Application Code (`app/`)
Main application code following Nuxt 4 conventions:
- `components/` - Vue components organized by domain (ui, character, environments, game)
- `composables/` - Shared logic for game mechanics, loading, multiplayer
- `stores/` - Pinia stores for state management
- `pages/` - Route pages
- `types/` - Centralized TypeScript type definitions
- `utils/` - Pure functions (character stats, ability modifiers, dice rolls)

### Static Content (`content/`)
Nuxt Content v3 JSON data files:
- Game data: origins, races, classes, spells, cantrips, levels, features, abilities
- Accessed via `queryCollection('collection-name').all()`
- Provides type-safe, file-based content management

### Server (`server/`)
Nitro server routes:
- `api/websocket.ts` - WebSocket handler for real-time multiplayer

## State Management

The application uses a **static data + dynamic state** separation pattern.

### Static Game Data Layer
**Location**: `content/` directory
**Purpose**: Read-only game definitions loaded once at initialization

Character templates (origins), races, classes, spells, cantrips, levels are:
- Loaded via Nuxt Content and cached in stores
- Joined with related data (e.g., templates enriched with full race/class objects)
- Shared across all players

**Stores**:
- `useRaceStore`, `useClassStore`, `useFeatureStore` - Domain-specific static data access

### Dynamic Game State Layer
**Location**: Pinia stores
**Purpose**: Runtime game state that changes during gameplay

**Core Stores**:
- `useGameStore` - Central state (character instances, players, items, levels, game mode)
- `useUserStore` - Current user identity, connection status
- `useLobbyStore` - Multiplayer lobby state
- `useUIStore` - UI state (modals, context menus)

**Persistence**: `useGameStore` uses session storage via `pinia-plugin-persistedstate`

### Templates vs. Instances Pattern

This architectural pattern separates definitions from runtime state:

| Aspect | Templates (Static) | Instances (Dynamic) |
|--------|-------------------|---------------------|
| **Source** | `content/` JSON files | Pinia store state |
| **Mutability** | Read-only | Mutable at runtime |
| **Scope** | Shared across all players | Per-user or per-session |
| **Examples** | Character template, race, class | Character with HP, position |

**Character Template** → **Character Instance** transformation:
1. User selects template (e.g., "Druid" origin)
2. System copies template data
3. Adds runtime state: current/max HP, position, user ID
4. Calculates modifiers from stats
5. Stores in `useGameStore.characters`

**Benefits**:
- Multiple players can use same template without conflicts
- Template data remains pristine
- Character progression doesn't modify base definitions
- Easy to add new content via JSON files

## SSR Configuration

**Routing rules** in `nuxt.config.ts`:

| Route | SSR | Reason |
|-------|-----|--------|
| `/` | ❌ Client-only | Main game requires WebGL |
| `/campaign/**` | ✅ Enabled | Static content pages |
| `/character/**` | ❌ Client-only | Character creator uses 3D preview |
| `/game/**` | ❌ Client-only | Game environment is WebGL-based |

**Rule**: WebGL/Three.js components cannot be server-side rendered. Use `ssr: false` for routes with 3D content.
