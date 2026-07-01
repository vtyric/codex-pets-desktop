# Release

## Build

Create a macOS release from the repository root:

```bash
pnpm nx run pet-host:dist-mac
```

The target writes artifacts to `release`.

## Install On macOS

Open the generated `.dmg`, drag `Codex Pets Desktop.app` into
`Applications`, eject the mounted DMG, then launch the app from
`Applications`.

The DMG is not an installer. Running the app directly from the mounted DMG can
work, but it is not the install flow.

The app is currently unsigned. On first launch macOS may block it. Use
right-click `Open` on `Codex Pets Desktop.app`, then confirm the launch.

## Smoke Check

After launch, the pet overlay should appear near the bottom-right of the active
display. The app has no normal main window; the pet overlay is the visible UI.

If the app opens but no pet appears, run the app binary from Terminal to see the
host logs:

```bash
/Applications/Codex\ Pets\ Desktop.app/Contents/MacOS/Codex\ Pets\ Desktop
```

The packaged renderer is loaded from the local app bundle, so `pet-overlay`
must be built with a relative base href. Keep `baseHref: "./"` in
`apps/pet-overlay/project.json`; an absolute `/` base makes the packaged app
open a transparent window without booting Angular.
