<script setup lang="ts">
import { ListboxRoot, ListboxFilter, ListboxContent } from 'reka-ui'
import theme from '#build/ui/command-palette'

// Command mode types and state
interface Command {
  id: string
  label: string
  description: string
  parameters: CommandParameter[]
}

interface CommandParameter {
  name: string
  type: 'string' | 'number' | 'boolean'
  required: boolean
  description: string
}

const isCommandMode = ref(false)
const currentCommand = ref<Command | null>(null)
const commandParameters = ref<Record<string, string>>({})

// Available commands
const commands = ref<Command[]>([
  {
    id: 'add-character',
    label: 'Add Character',
    description: 'Add a new character to the game',
    parameters: [
      {
        name: 'name',
        type: 'string',
        required: true,
        description: 'Character name',
      },
      {
        name: 'template',
        type: 'string',
        required: false,
        description: 'Character template key',
      },
    ],
  },
])

const props = defineProps<{
  ui?: {
    root?: string
    content?: string
    input?: string
  }
}>()

const gameStore = useGameStore()
const { addCharacter } = gameStore
const { characterTemplates } = storeToRefs(gameStore)
const open = ref(false)

const appConfig = useAppConfig()

const commandPaletteUi = computed(() => tailwindVariants({ extend: tailwindVariants(theme), ...(appConfig.ui?.commandPalette || {}) })())
console.log('ui', commandPaletteUi.value)
const searchTerm = defineModel<string>('searchTerm', { default: '' })

// Command mode handling
watch(searchTerm, (newValue) => {
  if (newValue.startsWith('/')) {
    isCommandMode.value = true
    const commandId = newValue.slice(1).split(' ')[0]
    currentCommand.value = commands.value.find(cmd => cmd.id === commandId) || null
  } else {
    isCommandMode.value = false
    currentCommand.value = null
    commandParameters.value = {}
  }
})

// Handle tab completion for commands
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Tab' && isCommandMode.value && searchTerm.value.startsWith('/')) {
    e.preventDefault()
    const commandId = searchTerm.value.slice(1).split(' ')[0]
    const matchingCommand = commands.value.find(cmd => cmd.id.startsWith(commandId))
    if (matchingCommand) {
      searchTerm.value = `/${matchingCommand.id}`
      currentCommand.value = matchingCommand
    }
  }
}

// Execute command when Enter is pressed
const executeCommand = () => {
  if (!currentCommand.value) return

  const args = searchTerm.value.slice(1).split(' ')
  const parameters = args.slice(1)

  if (currentCommand.value.id === 'add-character') {
    const name = parameters[0]
    const template = parameters[1]
    if (name) {
      addCharacter({
        name,
        key: template,
      })
      open.value = false
      searchTerm.value = ''
    }
  }
}

const characterName = ref('')
const characterTemplate = ref<CharacterTemplate | null>(null)

const groups = ref([
  {
    id: 'actions',
    items: [
      {
        id: 'new-character',
        label: 'New Character',
        icon: 'i-lucide-user-plus',
        slot: 'new-character-label' as const,
        kbds: [
          'N'
        ],
        onSelect: () => {
          addCharacter({
            name: characterName.value,
            key: characterTemplate.value?.key,
          })
        },
      },
    ],
  },
])

defineShortcuts({
  ...extractShortcuts(groups.value),
  'meta_k': () => {
    open.value = true
  },
})
</script>
<template>
<UModal v-model:open="open">
  <template #content>
    <ListboxRoot
      :class="commandPaletteUi.root({ class: props.ui?.root })"
    >
      <ListboxFilter v-model="searchTerm" as-child>
        <UInput
          :placeholder="isCommandMode ? 'Enter command parameters...' : 'Search'"
          :icon="appConfig.ui.icons.search"
          :class="props.ui?.input"
          @keydown="handleKeyDown"
          @keyup.enter="executeCommand"
        />
      </ListboxFilter>
      <ListboxContent :class="commandPaletteUi.content({ class: props.ui?.content })">
        <div v-if="isCommandMode && currentCommand" class="p-4 space-y-4">
          <div class="flex items-center gap-2">
            <UBadge color="primary" variant="soft">
              /{{ currentCommand.id }}
            </UBadge>
            <span class="text-sm text-gray-500">{{ currentCommand.description }}</span>
          </div>
          <div v-if="currentCommand.parameters.length" class="space-y-2">
            <div class="text-sm font-medium">Parameters:</div>
            <div v-for="param in currentCommand.parameters" :key="param.name" class="flex items-center gap-2">
              <UBadge :color="param.required ? 'error' : 'neutral'" variant="soft" size="sm">
                {{ param.name }}
              </UBadge>
              <span class="text-sm text-gray-500">{{ param.description }}</span>
            </div>
          </div>
        </div>
        <div v-else-if="isCommandMode" class="p-4">
          <div class="text-sm font-medium mb-2">Available Commands:</div>
          <div class="space-y-2">
            <div v-for="cmd in commands" :key="cmd.id" class="flex items-center gap-2">
              <UBadge color="primary" variant="soft">
                /{{ cmd.id }}
              </UBadge>
              <span class="text-sm text-gray-500">{{ cmd.description }}</span>
            </div>
          </div>
        </div>
        <div v-else>
          {{ searchTerm }}
        </div>
      </ListboxContent>
    </ListboxRoot>
  </template>
</UModal>
</template>