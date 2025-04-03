# Nuxt 3D DnD Game

This project is a Dungeons & Dragons-like 3D game, built entirely with Nuxt, TresJS, and ThreeJS ❤️

## Development

While this project uses `pnpm` as the package manager, you can use any package manager of your choice, such as `npm`, `yarn`, or `bun`.

### Getting Started

1. Clone the repository.
2. Install dependencies:
   ```sh
   pnpm install --frozen-lockfile
   ```
3. No `.env` file is required for this project at the moment.
4. Happy coding! ❤️

### Scripts

Here are some useful commands to get started:

| Command | Description |
|---------|-------------|
| `pnpm dev` | Run the project locally in development mode. |
| `pnpm dev --host` | Run the project in development mode and expose it on your network. |
| `pnpm build` | Build the project. |
| `node .output/server/index.mjs` | Serve the built project for testing. |

### better-sqlite3 Error on Server Start

If you, with `pnpm dev`, get an `better-sqlite3` error like:

```shell
ERROR Cannot start nuxt:  Could not locate the bindings file. Tried:
[...]
    → node_modules/.pnpm/better-sqlite3@11.8.1/node_modules/better-sqlite3/build/better_sqlite3.node
    → node_modules/.pnpm/better-sqlite3@11.8.1/node_modules/better-sqlite3/build/Debug/better_sqlite3.node
    → node_modules/.pnpm/better-sqlite3@11.8.1/node_modules/better-sqlite3/build/Release/better_sqlite3.node
    → node_modules/.pnpm/better-sqlite3@11.8.1/node_modules/better-sqlite3/out/Debug/better_sqlite3.node
    → node_modules/.pnpm/better-sqlite3@11.8.1/node_modules/better-sqlite3/Debug/better_sqlite3.node
    → node_modules/.pnpm/better-sqlite3@11.8.1/node_modules/better-sqlite3/out/Release/better_sqlite3.node
    → node_modules/.pnpm/better-sqlite3@11.8.1/node_modules/better-sqlite3/Release/better_sqlite3.node
    → node_modules/.pnpm/better-sqlite3@11.8.1/node_modules/better-sqlite3/build/default/better_sqlite3.node
[...]
```

Then try the following to solve it:

```shell
cd node_modules/better-sqlite3
yarn run build-release
```

If this does fails, use `yarn add -D node-gyp` in the root folder before it and try the build release again.

## Contributors

<a href="https://github.com/alvarosabu/nuxt-3d-dnd-game/graphs/contributors">
<img src="https://contrib.rocks/image?repo=alvarosabu/nuxt-3d-dnd-game" />
</a>

## License

<!-- TODO -->

The license for this project is currently undefined. Please check with the project owner for clarification.

<!-- maybe: -->
<!-- Published under the [MIT](https://github.com/unjs/rou3/blob/main/LICENSE) license. -->
<!-- For the full license text, please see the [LICENSE](./LICENSE.md) file. -->
