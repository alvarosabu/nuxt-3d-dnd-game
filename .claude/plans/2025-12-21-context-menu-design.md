# Custom Context Menu Design

**Date**: 2025-12-21
**Problem**: The wrapped UContextMenu pattern no longer works with TresJS v5.
**Solution**: Create a custom floating context menu positioned at click coordinates, matching Nuxt UI visual style.

---

## Architecture Overview

**Core Approach**: Custom floating menu component that listens for contextmenu events from TresJS objects, positions itself at click coordinates, and matches Nuxt UI's visual styling.

**Component Structure**:
- `GameContextMenu.vue` - Custom floating menu component (position: fixed)
- Updates to `useUIStore` - Add x/y coordinates to contextMenu state
- Updates to interactive 3D components (Chest.vue, etc.) - Add @contextmenu handlers

**Data Flow**:
1. User right-clicks on 3D object (TresGroup)
2. `@contextmenu` handler captures event, prevents default, stores coordinates and items in UIStore
3. `GameContextMenu` component watches store, positions itself at coordinates
4. User clicks menu item → callback executes, menu closes
5. When menu closes, OrbitControls re-enable automatically

**Key Benefits**:
- Full control over positioning (fixed at click point)
- Can disable/enable OrbitControls via reactive prop
- Reuses existing UIStore infrastructure
- No wrapper pattern needed

---

## State Management Changes

### Updates to `useUIStore.ts`

**Modify contextMenu state**:
```typescript
const contextMenu = reactive({
  enabled: false,
  isOpen: boolean,
  items: [] as ContextMenuItem[],
  x: 0,        // NEW: mouse X coordinate
  y: 0,        // NEW: mouse Y coordinate
})
```

**New action: `openContextMenu(x, y, items)`**:
```typescript
function openContextMenu(x: number, y: number, items: ContextMenuItem[]) {
  contextMenu.x = x
  contextMenu.y = y
  contextMenu.items = items
  contextMenu.enabled = true
  contextMenu.isOpen = true
}
```

**Keep existing `handleContextMenuOpen(open)` for closing**:
- When `open === false`, reset coordinates to 0, clear items, disable menu

### Updates to 3D object components (Chest.vue, future Door.vue)

**Remove from `@pointerenter`**:
- `setContextMenuItems()` calls
- `contextMenu.enabled = true`

**Add `@contextmenu` handler**:
```typescript
const handleContextMenu = (e: TresEvent) => {
  e.stopPropagation()
  e.preventDefault() // Prevent browser's default context menu

  // Get screen coordinates from pointer event
  const x = e.clientX || e.pointer.x
  const y = e.clientY || e.pointer.y

  uiStore.openContextMenu(x, y, isLocked.value
    ? [{ label: 'Lockpick', icon: 'i-lucide-lock', onSelect: lockpickAction }]
    : [{ label: 'Open', onSelect: () => { isOpen.value = true; syncChestState() } }]
  )
}
```

**Template**:
```vue
<TresGroup
  @contextmenu="handleContextMenu"
  @pointerenter="handlePointerEnter"
  @pointerleave="handlePointerLeave"
>
```

**Keep `@pointerenter/leave` for**:
- Outline effects
- Cursor changes
- Cleanup when menu closes

---

## GameContextMenu Component

**Location**: `app/components/game/GameContextMenu.vue`

**Template**:
```vue
<template>
  <Teleport to="body">
    <Transition name="context-menu">
      <div
        v-if="contextMenu.isOpen"
        ref="menuRef"
        :style="{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }"
        class="fixed z-50 min-w-[12rem] rounded-md border border-gray-700 bg-gray-900/75 backdrop-blur-xl shadow-xl p-1 overflow-hidden"
        @click.stop
      >
        <button
          v-for="(item, index) in contextMenu.items"
          :key="index"
          class="w-full flex items-center gap-2 px-2 py-1.5 rounded-sm text-sm text-gray-200 transition-colors hover:bg-gray-800 active:bg-gray-700 cursor-pointer"
          @click="handleItemClick(item)"
        >
          <UIcon v-if="item.icon" :name="item.icon" class="w-4 h-4" />
          <span>{{ item.label }}</span>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>
```

**Script**:
```vue
<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { useUIStore } from '~/stores/useUIStore'
import type { ContextMenuItem } from '~/types'

const uiStore = useUIStore()
const { contextMenu } = storeToRefs(uiStore)

const menuRef = ref<HTMLElement>()

// Close on click outside
onClickOutside(menuRef, () => {
  if (contextMenu.value.isOpen) {
    uiStore.handleContextMenuOpen(false)
  }
})

// Close on Escape key
onKeyStroke('Escape', () => {
  if (contextMenu.value.isOpen) {
    uiStore.handleContextMenuOpen(false)
  }
})

// Handle item click
function handleItemClick(item: ContextMenuItem) {
  if (item.onSelect) {
    item.onSelect()
  }
  uiStore.handleContextMenuOpen(false)
}
</script>

<style scoped>
.context-menu-enter-active,
.context-menu-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.context-menu-enter-from,
.context-menu-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
```

**Key features**:
- Teleport to body (escape parent positioning)
- Fixed positioning with dynamic coordinates
- Click outside to close (VueUse)
- Escape key to close
- Matches Nuxt UI styling
- Smooth enter/exit transitions

---

## OrbitControls Management

**Solution**: Use `:enabled` prop reactively bound to menu state.

**Implementation** (find where OrbitControls is used):
```vue
<script setup>
const uiStore = useUIStore()
const { contextMenu } = storeToRefs(uiStore)
</script>

<template>
  <OrbitControls :enabled="!contextMenu.isOpen" />
</template>
```

**Behavior**:
- Menu closed → controls enabled (normal camera movement)
- Menu open → controls disabled (camera frozen)
- Fully reactive, no manual logic needed

---

## Visual Styling

**Goal**: Match UContextMenu's dark theme appearance.

**Base container classes**:
- `min-w-[12rem]` - Minimum width
- `rounded-md` - Border radius
- `border border-gray-700` - Subtle border
- `bg-gray-900/75 backdrop-blur-xl` - Translucent dark background with blur
- `shadow-xl` - Drop shadow
- `p-1` - Padding for items
- `overflow-hidden` - Clean edges

**Menu item classes**:
- `w-full flex items-center gap-2` - Full width, horizontal layout
- `px-2 py-1.5` - Comfortable padding
- `rounded-sm` - Subtle rounding
- `text-sm text-gray-200` - Size and color
- `transition-colors` - Smooth hover
- `hover:bg-gray-800` - Hover state
- `active:bg-gray-700` - Active state

**Transition**:
- 150ms opacity + scale(0.95) transform
- Smooth, polished feel

---

## Type Updates

**Update `app/types/index.ts`**:

Find the contextMenu interface and add coordinates:
```typescript
contextMenu: {
  enabled: boolean
  isOpen: boolean
  items: ContextMenuItem[]
  x: number      // NEW
  y: number      // NEW
}
```

---

## Files to Modify

1. ✅ `app/types/index.ts` - Add x, y to contextMenu interface
2. ✅ `app/stores/useUIStore.ts` - Update state, add `openContextMenu()` method
3. ✅ `app/components/game/GameProvider.vue` - Remove UContextMenu wrapper, add GameContextMenu component
4. ✅ `app/components/game/GameContextMenu.vue` - New component (create)
5. ✅ `app/components/items/Chest.vue` - Replace hover pattern with @contextmenu handler
6. ✅ Find where OrbitControls is used - Add `:enabled` binding

---

## Testing Plan

1. ✅ Right-click on chest → menu appears at cursor
2. ✅ Click menu item → action executes, menu closes
3. ✅ Click outside menu → menu closes
4. ✅ Press Escape → menu closes
5. ✅ While menu open → camera doesn't rotate
6. ✅ After menu closes → camera works again
7. ✅ Right-click on empty canvas → no menu appears

---

## Edge Cases

1. **Menu near viewport edges**: Initially position at exact click coordinates (may clip). Future enhancement: viewport-aware positioning.

2. **Multiple rapid right-clicks**: Each opens new menu at new position. Previous closes automatically.

3. **Right-click on canvas background**: Menu won't open (no items set).

4. **Keyboard navigation**: Not in v1. Can add arrow key navigation later.

---

## Future Enhancements

- Viewport-aware positioning (adjust if near edges)
- Keyboard navigation (arrow keys, Enter to select)
- Submenu support (if needed)
- Loading states for async actions
- Disabled item states
