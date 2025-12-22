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

---

# Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use @superpowers:executing-plans to implement this plan task-by-task.

## Task 1: Update Type Definitions

**Files:**
- Modify: `app/types/index.ts:187-191`

**Step 1: Add x and y coordinates to contextMenu interface**

In `app/types/index.ts`, find the contextMenu interface (around line 187) and update:

```typescript
contextMenu: {
  enabled: boolean
  isOpen: boolean
  items: ContextMenuItem[]
  x: number
  y: number
}
```

**Step 2: Verify no TypeScript errors**

Run: `pnpm typecheck` (or check IDE for errors)
Expected: No errors related to contextMenu

**Step 3: Commit**

```bash
git add app/types/index.ts
git commit -m "feat: add x,y coordinates to contextMenu type"
```

---

## Task 2: Update UIStore with openContextMenu Method

**Files:**
- Modify: `app/stores/useUIStore.ts:23-27`

**Step 1: Add x and y to contextMenu reactive state**

In `app/stores/useUIStore.ts`, update the contextMenu reactive object (around line 23):

```typescript
const contextMenu = reactive({
  enabled: false,
  isOpen: false,
  items: [] as ContextMenuItem[],
  x: 0,
  y: 0,
})
```

**Step 2: Create openContextMenu function**

Add this function after the `handleContextMenuOpen` function (around line 202):

```typescript
/**
 * Opens the context menu at the specified coordinates with the given items
 * @param x The x coordinate (screen pixels)
 * @param y The y coordinate (screen pixels)
 * @param items The items to show in the context menu
 */
function openContextMenu(x: number, y: number, items: ContextMenuItem[]) {
  contextMenu.x = x
  contextMenu.y = y
  contextMenu.items = items
  contextMenu.enabled = true
  contextMenu.isOpen = true
}
```

**Step 3: Update handleContextMenuOpen to reset coordinates**

Modify the existing `handleContextMenuOpen` function:

```typescript
function handleContextMenuOpen(open: boolean) {
  contextMenu.isOpen = open

  if (!open) {
    contextMenu.items = []
    contextMenu.enabled = false
    contextMenu.x = 0
    contextMenu.y = 0
  }
}
```

**Step 4: Export openContextMenu in return statement**

In the return statement at the bottom (around line 248), add `openContextMenu`:

```typescript
return {
  // State
  contextMenu,
  diceRollModal,
  remoteRoll,
  showConfetti,
  // Actions
  openDiceRollModal,
  closeDiceRollModal,
  setContextMenuItems,
  handleContextMenuOpen,
  openContextMenu, // NEW
  triggerConfetti,
  hideConfetti,
}
```

**Step 5: Verify no errors**

Check IDE for TypeScript errors
Expected: No errors

**Step 6: Commit**

```bash
git add app/stores/useUIStore.ts
git commit -m "feat: add openContextMenu method to UIStore"
```

---

## Task 3: Create GameContextMenu Component

**Files:**
- Create: `app/components/game/GameContextMenu.vue`

**Step 1: Create the component file**

Create `app/components/game/GameContextMenu.vue` with the full code from the "GameContextMenu Component" section above.

**Step 2: Verify component renders without errors**

Start dev server: `pnpm dev`
Check browser console for errors
Expected: No errors (menu won't be visible yet since isOpen is false)

**Step 3: Commit**

```bash
git add app/components/game/GameContextMenu.vue
git commit -m "feat: create GameContextMenu component"
```

---

## Task 4: Update CameraControls to Disable When Menu Open

**Files:**
- Modify: `app/components/game/CameraControls.vue:1-24`

**Step 1: Import UIStore and get contextMenu ref**

In `app/components/game/CameraControls.vue`, add to script setup (after line 2):

```typescript
const uiStore = useUIStore()
const { contextMenu } = storeToRefs(uiStore)
```

**Step 2: Add :enabled prop to OrbitControls**

Update the `<OrbitControls>` component (around line 17):

```vue
<OrbitControls
  ref="orbitControlsRef"
  make-default
  :enable-damping="true"
  :damping-factor="0.05"
  :enabled="!contextMenu.isOpen"
/>
```

**Step 3: Test in browser**

Start dev: `pnpm dev`
Open browser, verify no errors
Expected: Camera controls work normally (menu not open yet)

**Step 4: Commit**

```bash
git add app/components/game/CameraControls.vue
git commit -m "feat: disable OrbitControls when context menu is open"
```

---

## Task 5: Update GameProvider to Use GameContextMenu

**Files:**
- Modify: `app/components/game/GameProvider.vue:1-40`

**Step 1: Remove UContextMenu wrapper, add GameContextMenu component**

Replace the template content in `app/components/game/GameProvider.vue`:

```vue
<template>
  <div>
    <UiCommandPalette />
    <UiDebugControls />
    <Hud />
    <GameContextMenu />
    <ConfettiExplosion
      v-if="showConfetti"
      :particle-count="200"
      :force="0.3"
      :stage-height="height"
      :stage-width="width"
    />
    <slot/>
  </div>
</template>
```

**Step 2: Remove unused contextMenu destructuring from script**

In the script setup, remove unused destructuring (line 7).

**Step 3: Verify in browser**

Run: `pnpm dev`
Check console for errors
Expected: No errors, app renders normally

**Step 4: Commit**

```bash
git add app/components/game/GameProvider.vue
git commit -m "feat: replace UContextMenu with GameContextMenu"
```

---

## Task 6: Update Chest Component with @contextmenu Handler

**Files:**
- Modify: `app/components/items/Chest.vue:146-189`

**Step 1: Create handleContextMenu function**

In `app/components/items/Chest.vue`, add this function after `handleClick` (around line 137):

```typescript
/**
 * Handles the context menu event on the chest
 * @param e - The pointer event from TresJS
 */
const handleContextMenu = (e: TresEvent) => {
  e.stopPropagation()
  e.preventDefault() // Prevent browser's default context menu

  // Get screen coordinates from pointer event
  const x = e.clientX ?? e.pointer.x
  const y = e.clientY ?? e.pointer.y

  uiStore.openContextMenu(x, y, isLocked.value
    ? [{
        label: 'Lockpick',
        icon: 'i-lucide-lock',
        onSelect: lockpickAction,
      }]
    : [
        {
          label: 'Open',
          onSelect: () => {
            isOpen.value = true
            syncChestState()
          },
        },
      ])
}
```

**Step 2: Update handlePointerEnter to remove context menu logic**

Modify `handlePointerEnter` (around line 146) to remove lines 150-165 (setContextMenuItems calls).

**Step 3: Update handlePointerLeave to simplify**

Modify `handlePointerLeave` (around line 173) to remove context menu state management.

**Step 4: Add @contextmenu to TresGroup**

Update the `<TresGroup>` template (around line 225):

```vue
<TresGroup
  v-if="item"
  ref="chestRef"
  :name="item.id"
  :position="chestPosition"
  @click="handleClick"
  @contextmenu="handleContextMenu"
  @pointerenter="handlePointerEnter"
  @pointerleave="handlePointerLeave"
>
```

**Step 5: Test in browser**

Run: `pnpm dev`
Navigate to the game
Right-click on the chest
Expected: Context menu appears at cursor position with "Lockpick" option

**Step 6: Commit**

```bash
git add app/components/items/Chest.vue
git commit -m "feat: add @contextmenu handler to Chest component"
```

---

## Task 7: Manual Testing & Cleanup

**Step 1: Test all context menu behaviors**

- Right-click on locked chest → menu appears
- Click "Lockpick" → dice roll modal, menu closes
- Right-click again → click outside → menu closes
- Right-click again → press Escape → menu closes
- Verify camera controls disabled while menu open
- Verify camera controls work after menu closes

**Step 2: Check if setContextMenuItems is still used**

Search codebase:
```bash
grep -r "setContextMenuItems" app/
```

If unused, remove from `app/stores/useUIStore.ts`

**Step 3: Final commit**

```bash
git add .
git commit -m "refactor: cleanup unused context menu methods"
```

---

## Success Criteria

✅ Right-click on chest opens context menu at cursor position
✅ Menu items render with correct labels and icons
✅ Clicking menu item executes action and closes menu
✅ Clicking outside menu closes it
✅ Pressing Escape closes menu
✅ Camera controls disabled while menu is open
✅ Camera controls re-enable when menu closes
✅ Menu matches Nuxt UI visual styling
✅ No TypeScript errors
✅ No console errors
