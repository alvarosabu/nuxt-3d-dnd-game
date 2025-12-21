# Tech Stack & Framework Notes

## Core Technologies

### Nuxt 4
- **Version**: 4.x (not Nuxt 3)
- Uses `app/` directory convention (not `src/`)
- Auto-imports components, composables, and utils

### TresJS v5
- Three.js integration for Vue 3
- Declarative 3D scene management
- Use Vue components: `<TresCanvas>`, `<TresMesh>`, `<TresPerspectiveCamera>`, etc.
- Cientos provides ready-made 3D components and controls
- Leches provides developer tools (controls, debugging)

### Pinia
- Official Vue 3 state management
- Composition API style (`defineStore` with setup function)
- Plugin: `pinia-plugin-persistedstate` for session/local storage

### Nuxt Content v3
- Content stored as JSON files in `content/` directory
- Query via `queryCollection('collection-name').all()`
- Auto-typed based on file structure

### Nuxt UI v4
- Component library built on Radix Vue and Tailwind CSS
- Provides accessible UI primitives
- Configured via `app.config.ts`

## Additional Modules

- **@vueuse/core** - Vue composition utilities
- **@nuxt/eslint** - ESLint integration with Nuxt-aware rules
- **nuxt-svgo** - SVG optimization
- **GSAP** - Animation library (likely for character/UI animations)

## WebSocket Configuration

Requires experimental Nitro feature in `nuxt.config.ts`:

```typescript
nitro: {
  experimental: {
    websocket: true
  }
}
```

WebSocket route: `/api/websocket`

## TypeScript

- All types defined in `app/types/index.ts`
- Strong typing for game entities (Character, Player, GameItem, Level, etc.)
- Content collections should match type schemas

## Key Framework Patterns

### Auto-imports
Nuxt 4 auto-imports:
- Components from `app/components/`
- Composables from `app/composables/`
- Utils from `app/utils/`
- Stores (access via `useStoreName()`)

No explicit imports needed for these.

### Composable Pattern
Custom composables follow Vue conventions:
- Named `useSomething`
- Return reactive state and methods
- Use `createSharedComposable` for singleton behavior (e.g., `useMultiplayer`)

### 3D Scene Management
TresJS uses Vue's reactivity system:
- 3D objects are Vue components
- Props are reactive (changing props updates Three.js objects)
- Use refs for imperative Three.js access when needed
- Dispose is handled automatically

## Important Constraints

### Content Schema Validation
Content files must match expected types:
- `origins/` → CharacterTemplate
- `races/` → Race
- `classes/` → Class
- `spells/` → Spell
- etc.


### SSR Restrictions
WebGL/Three.js components cannot be SSR'd:
- Use `ssr: false` in route rules
- Wrap in `<ClientOnly>` if in mixed SSR page
- Ensure `window`, `document` checks before accessing

### WebSocket Lifecycle
- WebSocket connects immediately on composable mount
- Must handle reconnection on page reload
- State sync required after reconnection
