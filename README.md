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

### If you already or still have a older install of this repository before Nuxt 3.16.1, you might get a `better-sqlite3` error on server start

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

Then do the following to solve it:

1. Delete the `node_modules` folder.
2. Delete the `.nuxt` folder.
3. Delete the `pnpm-lock.yaml` file.
4. Grab the latest version of the upstream 'package.json' file and replace your current one with it.
5. Double check if the `package.json` file has the `better-sqlite3` under "pnpm.onlyBuiltDependencies".

```json
    "pnpm": {
      "ignoredBuiltDependencies": [
        "@parcel/watcher",
      "esbuild"
    ],
    "onlyBuiltDependencies": [
      "better-sqlite3",
      "sharp"
    ]
  }
```
5. Run `pnpm install` to install the dependencies.
6. Run `pnpm dev` to start the development server.

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
