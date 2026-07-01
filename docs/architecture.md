# Codex Pets Desktop

Codex Pets Desktop is a standalone desktop application built with Electron and Angular.

The application must work like Codex Pets, but it must run separately from Codex.

The main goal is to keep compatibility with pets from the original Codex Pets.

## Project purpose

Codex Pets Desktop must run a desktop pet in a standalone Electron application.

The application must support the same pet assets as the original Codex Pets app.

The application must support a similar pet installation flow.

The application must not depend on Codex being launched.

## Main requirements

– The application starts separately through Electron.

– Angular micro-frontends own UI rendering for their own feature area.

– Electron owns windows, tray, file system, system APIs, and frontend
orchestration.

– The pet is rendered in a transparent window.

– The pet window can stay above other windows.

– The pet can be moved around the screen.

– The pet can play sprite animations.

– Pets can be installed from external files or folders.

– Installed pets are stored locally.

– The active pet is saved between launches.

– The asset format must be compatible with the original Codex Pets.

## Frontend boundaries

`pet-host` is the Electron shell. It must not own Angular UI. It creates native
windows, exposes typed IPC, serves local assets, and loads renderer
frontends.

`pet-host` dependencies are composed through the Awilix DI container in
`pet-host-container.ts`. `main.ts` is only the bootstrap entry point. Host
features must be added as services and registered in the container instead of
being created as module-level singletons.

```text
apps/pet-host/src
├── main.ts                 Bootstrap only
├── application             Electron lifecycle orchestration
├── container               Awilix composition root
├── ipc                     Typed IPC handlers and action bridge
├── pet                     Pet state, assets, and host events
└── window                  Native pet window controllers and sizing
```

Each major UI entity is modeled as a separate frontend app:

```text
apps
├── pet-host       Electron host and native orchestration
├── pet-overlay    Angular pet overlay frontend
└── pet-shared     Shared typed IPC contracts
```

Future settings UI must be added as a separate frontend app next to
`pet-overlay`, not inside the pet overlay source tree.

Inside `pet-overlay`, the pet feature is grouped under one boundary:

```text
src/app/pet-overlay
├── domain         Pet model, sprite, animation, and action rules
├── host           Renderer bridge to Electron host events
├── sprite         Sprite renderers
└── window         Pet overlay window UI
```

The root Angular `App` in `pet-overlay` is only a bootstrap composition point.
Pet loading, pet state, and pet UI stay inside the `pet-overlay` feature
boundary.

Pet movement and hover are native-window state, not DOM dragging. `pet-host`
observes Electron `BrowserWindow` move events and cursor position inside the
pet window bounds. `PetWindowActionController` maps horizontal movement deltas
to `running-left` or `running-right`, maps hover to the hover animation, and
maps vertical native window movement to no action. `pet-host` sends typed
`pet:action-changed` IPC events to `pet-overlay`.

The renderer does not read pointer hover or drag state. It only consumes the
current host action and plays the sprite. `PetAnimationPlayer` owns frame
playback, and `PetSprite` owns atlas frame rendering. When the effective pet
action changes, the sprite playback resets to the first frame of the new action
before continuing with that action's timing.

Pet overlay size is host-owned. The renderer adapts to the native window size
and must not resize the native pet window directly. Resize controls are
rendered by `pet-overlay` only as passive UI. Native resize is owned by
`pet-host`: `BrowserWindow` is resizable, `PetWindowSizeService` provides
min/max sizes and the Codex atlas cell aspect ratio, and the host listens to
native resize events to keep the stored size and visible work area valid. The
renderer uses viewport-sized layout (`100vw`/`100vh`) so it adapts after the
host changes the native window size.

The pet overlay must not appear in macOS screenshots or screen recordings.
This is host-owned: `PetWindowCaptureProtectionService` applies Electron
content protection to the native pet window on macOS. Renderer code must not
try to detect screenshot gestures or hide itself with timers.

macOS launch-at-login is host-owned. `PetLoginItemService` enables
`openAtLogin` through Electron login item settings only for packaged macOS
builds, so development runs do not register temporary Electron binaries.

## Packaging

macOS packaging uses `electron-builder.yml` from the repository root. The
packaging target must build `pet-overlay` in production mode, bundle
`pet-host`, then run `electron-builder` for macOS. Packaged app files are
written to `release`. Packaging is exposed only as the Nx project target
`pet-host:dist-mac`; root `package.json` scripts must not duplicate project
targets. The generated DMG must expose the app bundle and an `/Applications`
link so installation is the standard drag-to-Applications flow.

## Codex Pets compatibility

Installed pets must preserve the original Codex Pets package shape:

```text
pets
├── .active-pet.json
└── <pet-id>
    ├── pet.json
    └── <spritesheet asset>
```

The active pet file uses:

```json
{
  "activePetId": "eris"
}
```

The pet manifest uses the Codex Pets `pet.json` fields:

```json
{
  "id": "eris",
  "displayName": "Eris",
  "description": "...",
  "spritesheetPath": "spritesheet.png",
  "kind": "person"
}
```

Application-specific metadata must not be written into `pet.json`.

The renderer must not receive direct `file://` asset URLs. Local pet assets are exposed through the Electron-owned `pet://asset/...` protocol so Angular can load spritesheets from both the app pet storage and compatible Codex Pets storage.

Codex Pets spritesheets are rendered with the same fixed sprite atlas contract
as Codex:

```text
Atlas: 1536x1872
Grid: 8 columns x 9 rows
Cell: 192x208
Rows:
0 idle, 6 frames
1 running-right, 8 frames
2 running-left, 8 frames
3 waving, 4 frames
4 jumping, 5 frames
5 failed, 8 frames
6 waiting, 6 frames
7 running, 6 frames
8 review, 6 frames
```

Animation playback is owned by the renderer pet model. Non-idle actions play
three full loops, then transition to slow idle. Slow idle uses the idle row
with a 6x duration multiplier.

The renderer positions frames through CSS `background-position` percentages:
`columnIndex / 7 * 100%` and `rowIndex / 8 * 100%`. The sprite element uses
the Codex avatar dimensions: `width: 7.04rem`, `aspect-ratio: 192 / 208`,
`background-size: 800% 900%`, and `image-rendering: pixelated`.

Frame timing:

```text
idle: [280, 110, 110, 140, 140, 320]
jumping: [140, 140, 140, 140, 280]
running-left: [120, 120, 120, 120, 120, 120, 120, 220]
running-right: [120, 120, 120, 120, 120, 120, 120, 220]
running: [120, 120, 120, 120, 120, 220]
waving: [140, 140, 140, 280]
waiting: [150, 150, 150, 150, 150, 260]
review: [150, 150, 150, 150, 150, 280]
failed: [140, 140, 140, 140, 140, 140, 140, 240]
```
