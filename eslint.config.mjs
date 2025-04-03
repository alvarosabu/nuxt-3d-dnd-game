import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // your custom flat configs go here, for example:
  // {
  //   files: ['**/*.ts', '**/*.tsx'],
  //   rules: {
  //     'no-console': 'off' // allow console.log in TypeScript files
  //   }
  // },
  // {
  //   ...
  // }
  {
    rules: {
      'vue/attribute-hyphenation': 'off',
      'vue/html-self-closing': 'off',
      'no-case-declarations': 'off',
    }
  }
)
