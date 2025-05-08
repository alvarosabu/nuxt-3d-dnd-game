import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    levels: defineCollection({
      type: 'data',
      source: 'levels/**.json',
      schema: z.object({
        slug: z.string(),
        name: z.string(),
        environment: z.object({
          fogColor: z.string(),
          ambientLight: z.number(),
          background: z.string().optional(),
          blur: z.number(),
          clearColor: z.string(),
        }),
        grid: z.object({
          size: z.tuple([z.number(), z.number()]),
          cellSize: z.number(),
        }),
        spawnPoints: z.object({
          player: z.object({
            position: z.tuple([z.number(), z.number(), z.number()]),
            rotation: z.tuple([z.number(), z.number(), z.number()]),
          }),
        }),
        items: z.array(z.object({
          id: z.string(),
          type: z.enum(['chest', 'door']),
          position: z.tuple([z.number(), z.number(), z.number()]),
          rotation: z.tuple([z.number(), z.number(), z.number()]).optional(),
          state: z.record(z.string(), z.any()),
        })),
        model: z.string(),
      }),
    }),

    origins: defineCollection({
      type: 'data',
      source: 'origins/**.json',
      schema: z.object({
        name: z.string(),
        key: z.string(),
        model: z.string(),
        title: z.string(),
        originName: z.string(),
        lastName: z.string().optional(),
        description: z.string(),
        portrait: z.string(),
        race: z.string(),
        class: z.string(),
        stats: z.object({
          str: z.number(),
          dex: z.number(),
          con: z.number(),
          int: z.number(),
          wis: z.number(),
          cha: z.number(),
        }),
        weapon: z.string(),
      }),
    }),

    spells: defineCollection({
      type: 'data',
      source: 'spells/**.json',
      schema: z.object({
        name: z.string(),
        slug: z.string(),
        icon: z.string(),
        description: z.string(),
        level: z.number(),
        school: z.string(),
      }),
    }),

    cantrips: defineCollection({
      type: 'data',
      source: 'cantrips/**.json',
      schema: z.object({
        name: z.string(),
        slug: z.string(),
        icon: z.string(),
        description: z.string(),
        school: z.string(),
      }),
    }),

    features: defineCollection({
      type: 'data',
      source: 'features/**.json',
      schema: z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string(),
        source: z.string(),
        mechanics: z.object({
          bonus: z.string(),
        }),
      }),
    }),

    abilities: defineCollection({
      type: 'data',
      source: 'abilities/**.json',
      schema: z.object({
        name: z.string(),
        slug: z.string(),
        short: z.string(),
        description: z.string(),
        icon: z.string(),
        mechanics: z.string(),
      }),
    }),

    feats: defineCollection({
      type: 'data',
      source: 'feats/**.json',
      schema: z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string(),
        source: z.string(),
        mechanics: z.string(),
      }),
    }),

    progressions: defineCollection({
      type: 'data',
      source: 'progressions/**.json',
      schema: z.object({
        class: z.string(),
        subclass: z.string().optional(),
        level: z.number(),
        passivesAdded: z.array(z.string()),
        passivesRemoved: z.array(z.string()),
        boosts: z.array(z.string()),
        allowImprovement: z.boolean(),
        selectors: z.array(z.string()),
        isMulticlass: z.boolean(),
      }),
    }),

    subclasses: defineCollection({
      type: 'data',
      source: 'subclasses/**.json',
      schema: z.object({
        name: z.string(),
        slug: z.string(),
        class: z.string(),
        description: z.string(),
        icon: z.string(),
        features: z.array(z.string()),
      }),
    }),

    passives: defineCollection({
      type: 'data',
      source: 'passives/**.json',
      schema: z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string(),
        icon: z.string(),
        enabledConditions: z.string(),
        boosts: z.array(z.string()),
      }),
    }),

    races: defineCollection({
      type: 'data',
      source: 'races/**.json',
      schema: z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string(),
        features: z.array(z.string()),
      }),
    }),

    classes: defineCollection({
      type: 'data',
      source: 'classes/**.json',
      schema: z.object({
        name: z.string(),
        slug: z.string(),
        icon: z.string(),
        description: z.string(),
        baseHitPoints: z.number(),
        hpPerLevel: z.number(),
        hitDie: z.string(),
        primaryAbility: z.string(),
        spellCastingAbility: z.string(),
        hasGod: z.boolean(),
        savingThrows: z.array(z.string()),
        features: z.array(z.string()),
        proficiencies: z.object({
          weapons: z.array(z.string()),
          armor: z.array(z.string()),
          skills: z.array(z.string()),
        }),
        spells: z.array(z.string()),
        cantrips: z.array(z.string()),
      }),
    }),

    actionResources: defineCollection({
      type: 'data',
      source: 'action-resources/**.json',
      schema: z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string(),
        replenishType: z.enum(['turn', 'short-rest', 'long-rest', 'never']),
        icon: z.string(),
        color: z.string(),
      }),
    }),

    actions: defineCollection({
      type: 'data',
      source: 'actions/**.json',
      schema: z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string(),
        icon: z.string(),
        cost: z.array(z.string()),
        kbds: z.array(z.string()).optional(),
        category: z.enum([
          'common',
          'class',
          'racial',
          'weapon',
          'spell',
          'situational',
        ]),
        source: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }),
    }),
  },
})
