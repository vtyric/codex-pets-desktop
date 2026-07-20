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
├── pet-manager             Host-side manager adapters grouped by feature
├── platform                Shared host platform constants
└── window                  Native pet window controllers and sizing
```

Each major UI entity is modeled as a separate frontend app:

```text
apps
├── pet-host       Electron host and native orchestration
├── pet-overlay    Angular pet overlay frontend
├── pet-manager    Angular pet management frontend
├── pet-shared     Shared typed IPC contracts
└── ../libs/pet-domain
```

Pet management UI must be a separate frontend app next to `pet-overlay`, not
inside Electron host code and not inside the pet overlay source tree.
`pet-manager` owns screens for viewing installed pets, searching pets, deleting
pets through menus, adding pets through the existing Codex Pets CLI, selecting
the active pet, and switching the manager theme. User-facing manager strings must
use Angular template i18n markers. English is the default source locale. Language
switching loads Angular `$localize` translations before bootstrap and reloads the
manager window when the user selects another language, not as a runtime
translation pipe. Complete translation dictionaries for every supported manager
language live as JSON files under `pet-manager/i18n/translations`; TypeScript only
selects and loads the active dictionary. Templates use Angular's short custom-ID
markers such as `i18n-label="@@petManagerAddPetAction"`; the custom ID matches the
JSON key.
Electron only owns the native window that hosts this frontend and the typed IPC
adapter to filesystem-backed pet storage.

Electron intercepts the manager window's native close event so closing the
manager never stops the host or the pet. The window is hidden on macOS and
minimized on Windows; activating the macOS Dock app restores it. Closing also
reloads the manager renderer so transient Angular screen state is reset, while
persisted preferences and filesystem-backed pet state remain intact. During a
real application quit, Electron is allowed to destroy the window normally.

Pure pet behavior lives in `libs/pet-domain`. This library must not import
Electron, Angular, DOM, filesystem, protocol, or IPC APIs. Host and renderer
apps are adapters over this domain.

`pet-domain` owns:

```text
libs/pet-domain/src
├── index.ts       Public domain API for host and renderer adapters
├── pet
│   ├── creation    Flow for validating Codex manifests and creating pet state
│   ├── runtime     Desktop pet aggregate and shared pet types
│   ├── animation   Frame timing and playback rules
│   ├── sprite      Sprite atlas and background-position logic
│   └── interaction Host-independent action rules
└── window
    ├── window-types.ts
    └── pet-window-size-policy.ts
```

Pet creation flow is explicit: host adapters pass an unknown Codex manifest to
`PetCreationFlow`, the flow validates it, creates `PetState`, and the renderer
builds a `DesktopPet` from that state. Runtime features such as actions,
animation playback, and sprite atlas rendering stay separate from creation so
they can be added incrementally without turning the pet class into host or UI
code. Window behavior is a separate domain entity: size types and size policy
live under `window`, not under `pet`.

Pet management is not modeled as a separate domain application. It is ordinary
desktop-app glue: `pet-manager` renders screens and dialogs, `pet-host`
implements filesystem-backed operations in `PetManagerStateService`, and
`pet-shared` owns the typed IPC contracts used between them.

Manager host code must stay split by change reason. `PetManagerStateService`
is only the orchestration facade used by IPC. Manager host files are grouped by
feature so folders do not become flat piles of services:

```text
apps/pet-host/src/pet-manager
├── catalog   Installed pet catalog loading and filtering
├── commands  State-changing pet commands
├── state     Current manager state assembly and IPC facade
└── view      Screen/action view models for the manager frontend
```

New manager behavior should extend the small service that owns that behavior
instead of growing one central service or adding a new generic app model.

Inside `pet-overlay`, the pet feature is grouped under one UI boundary:

```text
src/app/pet-overlay
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

The pet window must not follow the cursor between physical displays. It stays
on the display where the native window currently is and is only clamped into
that display's visible work area when screen metrics change. macOS Spaces are
handled through Electron's visible-on-all-workspaces window policy, so switching
workspaces on the same display keeps the pet available without moving it to
another monitor.

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

Release packaging uses `electron-builder.yml` from the repository root. The
release target must build `pet-overlay` and `pet-manager` in production mode,
bundle `pet-host`, then run `electron-builder` for macOS and Windows. Packaged
app files are written to `release`. Packaging is exposed through Nx project
targets such as `pet-host:dist`, `pet-host:dist-mac`, and `pet-host:dist-win`;
root `package.json` scripts must not duplicate project targets. The generated
DMG must expose the app bundle and an `/Applications` link so installation is
the standard drag-to-Applications flow. Publishing a GitHub Release builds
macOS `x64` and `arm64` artifacts plus Windows `x64` artifacts on native GitHub
Actions runners and attaches the installers to that release. Pushes to `main`
run the same native builds and retain the installers as short-lived workflow
artifacts without creating a GitHub Release. Packaged application versions come
from the root `package.json`; release tags are validated against that version.
Manual release builds accept an existing release tag, build that tagged source,
and replace the matching GitHub Release assets.

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

The renderer must not receive direct `file://` asset URLs. Local pet assets are
registered in the Electron host asset registry and exposed through opaque
`pet://asset?id=...` URLs. The protocol handler only serves file URLs that were
registered by the host.

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
