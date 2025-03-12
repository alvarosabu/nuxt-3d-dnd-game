import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    levels: defineCollection({
      type: 'data',
      source: 'levels/**.json',
      schema: z.object({
        slug: z.string(),
        name: z.string(),
        ambient: z.object({
          light: z.number(),
          environment: z.enum(['sunset', 'dawn', 'night', 'day']),
        }),
        grid: z.object({
          size: z.tuple([z.number(), z.number()]),
          cellSize: z.number(),
        }),
        items: z.array(z.object({
          id: z.string(),
          type: z.enum(['chest', 'door']),
          position: z.tuple([z.number(), z.number(), z.number()]),
          rotation: z.tuple([z.number(), z.number(), z.number()]).optional(),
          state: z.record(z.string(), z.any()),
        })),
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
        description: z.string(),
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
        hitDie: z.string(),
        primaryAbility: z.string(),
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
  },
})
