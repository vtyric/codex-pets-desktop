# Repository rules

## Build commands

Agents must not run build commands.

Do not run:

```bash
pnpm nx build ...
pnpm nx run ...:build
pnpm nx run ...:package
pnpm nx run ...:make
electron-builder
```

After code changes, agents may run only lint checks for changed projects.

Allowed:

```bash
pnpm nx lint <project-name>
```

If a build is needed, ask the user to run it and paste the result.