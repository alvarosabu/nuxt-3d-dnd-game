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
  type: 'string' | 'number' | 'boolean' | 'select'
  required: boolean
  description: string
  options?: { label: string; value: string }[]
  badgeColor?: 'primary' | 'neutral' | 'error' | 'warning' | 'success'
}

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
const searchTerm = defineModel<string>('searchTerm', { default: '' })

// Command mode state
const isCommandMode = ref(false)
const currentCommand = ref<Command | null>(null)
const commandParameters = ref<Record<string, string>>({})
const currentParameterIndex = ref(-1)
const inputValue = ref('')
const commandInput = ref('')

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
        badgeColor: 'error'
      },
      {
        name: 'template',
        type: 'select',
        required: false,
        description: 'Character template key',
        badgeColor: 'neutral',
        options: characterTemplates.value.map(template => ({
          label: template.name,
          value: template.key,
        })),
      },
    ],
  },
])

// Handle tab completion for commands and parameters
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Tab') {
    e.preventDefault()
    
    if (!isCommandMode.value && commandInput.value.startsWith('/')) {
      // Command completion
      const commandId = commandInput.value.slice(1).split(' ')[0]
      const matchingCommand = commands.value.find(cmd => cmd.id.startsWith(commandId))
      if (matchingCommand) {
        commandInput.value = `/${matchingCommand.id}`
        currentCommand.value = matchingCommand
        isCommandMode.value = true
        currentParameterIndex.value = 0
        inputValue.value = ''
      }
    } else if (isCommandMode.value && currentCommand.value) {
      // Parameter completion
      const currentParam = currentCommand.value.parameters[currentParameterIndex.value]
      if (currentParam && inputValue.value) {
        commandParameters.value[currentParam.name] = inputValue.value
        inputValue.value = ''
        currentParameterIndex.value++
        
        // If we've filled all parameters, execute the command
        if (currentParameterIndex.value >= currentCommand.value.parameters.length) {
          executeCommand()
        }
      }
    }
  } else if (e.key === 'Backspace' && inputValue.value === '') {
    // Handle backspace to go back to previous parameter
    if (currentParameterIndex.value > 0) {
      currentParameterIndex.value--
      const prevParam = currentCommand.value?.parameters[currentParameterIndex.value]
      if (prevParam) {
        inputValue.value = commandParameters.value[prevParam.name] || ''
      }
    } else {
      // Go back to command input
      currentParameterIndex.value = -1
      isCommandMode.value = false
      commandInput.value = `/${currentCommand.value?.id || ''}`
      inputValue.value = ''
    }
  }
}

// Handle input value changes for parameters
watch(inputValue, (newValue) => {
  if (isCommandMode.value && currentCommand.value && currentParameterIndex.value >= 0) {
    const currentParam = currentCommand.value.parameters[currentParameterIndex.value]
    if (currentParam) {
      commandParameters.value[currentParam.name] = newValue
    }
  }
})

// Handle select parameter changes
const handleSelectChange = (value: { label: string; value: string }) => {
  if (isCommandMode.value && currentCommand.value && currentParameterIndex.value >= 0) {
    const currentParam = currentCommand.value.parameters[currentParameterIndex.value]
    if (currentParam) {
      commandParameters.value[currentParam.name] = value.value
      // Move to next parameter after selection
      currentParameterIndex.value++
      inputValue.value = ''
      
      // If we've filled all parameters, execute the command
      if (currentParameterIndex.value >= currentCommand.value.parameters.length) {
        executeCommand()
      }
    }
  }
}

// Reset all command state
const resetCommandState = () => {
  isCommandMode.value = false
  currentCommand.value = null
  commandParameters.value = {}
  currentParameterIndex.value = -1
  inputValue.value = ''
  commandInput.value = ''
  searchTerm.value = ''
}

// Watch open state to reset when closed
watch(open, (newValue) => {
  if (!newValue) {
    resetCommandState()
  }
})

// Execute command when Enter is pressed
const executeCommand = () => {
  if (!currentCommand.value) return

  if (currentCommand.value.id === 'add-character') {
    const name = commandParameters.value.name
    const template = commandParameters.value.template
    if (name) {
      addCharacter({
        name,
        key: template,
        custom: false,
      })
      open.value = false
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
    resetCommandState() // Reset state when opening with shortcut too
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
        <div class="flex items-center gap-2 p-2">
          <div v-if="isCommandMode && currentCommand" class="flex items-center gap-2">
            <UBadge color="primary" variant="soft">
              /{{ currentCommand.id }}
            </UBadge>
            <template v-for="(value, name) in commandParameters" :key="name">
              <UBadge 
                v-if="value" 
                :color="currentCommand.parameters.find(p => p.name === name)?.badgeColor || 'neutral'" 
                variant="soft"
              >
                {{ value }}
              </UBadge>
            </template>
          </div>
          <template v-if="isCommandMode">
            <UInputMenu
              v-if="currentCommand && currentParameterIndex >= 0 && currentCommand.parameters[currentParameterIndex].type === 'select'"
              v-model="commandParameters[currentCommand.parameters[currentParameterIndex].name]"
              :items="currentCommand.parameters[currentParameterIndex].options || []"
              :placeholder="`Select ${currentCommand.parameters[currentParameterIndex].name}...`"
              autofocus
              :class="props.ui?.input"
              variant="none"
              @update:model-value="handleSelectChange"
            />
            <UInput
              v-else
              v-model="inputValue"
              :placeholder="currentCommand 
                ? currentParameterIndex >= 0 
                  ? `Enter ${currentCommand.parameters[currentParameterIndex].name}...`
                  : 'Enter command...'
                : 'Search'"
              :class="props.ui?.input"
              variant="none"
              autofocus
              @keydown="handleKeyDown"
              @keyup.enter="executeCommand"
            />
          </template>
          <UInput
            v-else
            v-model="commandInput"
            placeholder="Search or type / for commands..."
            :icon="appConfig.ui.icons.search"
            :class="props.ui?.input"
            variant="none"
            autofocus
            @keydown="handleKeyDown"
          />
        </div>
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
            <div
              v-for="(param, index) in currentCommand.parameters" 
              :key="param.name" 
              class="flex items-center gap-2"
              :class="{ 'opacity-50': index < currentParameterIndex }"
            >
              <UBadge 
                :color="param.badgeColor || (param.required ? 'error' : 'neutral')" 
                variant="soft" 
                size="sm"
              >
                {{ param.name }}
              </UBadge>
              <span class="text-sm text-gray-500">{{ param.description }}</span>
            </div>
          </div>
        </div>
        <div v-else-if="commandInput.startsWith('/')" class="p-4">
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