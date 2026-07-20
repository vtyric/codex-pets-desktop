# Release

## Build

Create macOS and Windows release artifacts from the repository root:

```bash
pnpm nx run pet-host:dist
```

Create only a macOS release:

```bash
pnpm nx run pet-host:dist-mac
```

Create only a Windows release:

```bash
pnpm nx run pet-host:dist-win
```

The target writes artifacts to `release`.

## GitHub Release

The desktop build workflow starts after every push or merged pull request to
`main`, when a GitHub Release is published, or when it is started manually from
the Actions page. Every build keeps its installers as workflow artifacts for
seven days.

After successful macOS and Windows builds from `main`, the workflow creates a
GitHub Release named `v<package.json version>` and attaches the installers. If a
release with that version already belongs to another commit, publication fails
and the version in `package.json` must be increased before the next merge.

Publishing an existing GitHub Release or running the workflow manually also
attaches the installers to that release. The packaged application version always
comes from the root `package.json`. The release tag must match that version with
an optional `v` prefix, for example package version `1.0.0` and tag `v1.0.0`.

To rebuild installers manually and attach them to an existing GitHub Release,
run this command from the repository root:

```bash
gh workflow run release.yml --ref main -f release_tag=v1.0.0
```

This command requires GitHub CLI authentication:

```bash
brew install gh
gh auth login --hostname github.com --git-protocol ssh --web
```

Alternatively, open the repository's GitHub Actions page, select
`Build desktop installers`, choose `Run workflow`, and enter `release_tag`.
This browser flow does not require a local token.

The workflow checks out the provided tag, verifies it against the version in
`package.json`, and replaces release assets with the same names. The GitHub
Release and its tag must exist before running the command.

`electron-builder` only creates local installers and is always invoked with
`--publish never`. The workflow's publish job uploads release assets using the
automatic GitHub Actions token.

The workflow builds and attaches these installers to the published release:

– macOS Intel (`x64`) DMG and ZIP

– macOS Apple Silicon (`arm64`) DMG and ZIP

– Windows (`x64`) NSIS installer and ZIP

Keep the GitHub Release in draft state until its tag and notes are ready;
publishing it starts the builds.

## Install On macOS

Open the generated `.dmg`, drag `Codex Pets Desktop.app` into
`Applications`, eject the mounted DMG, then launch the app from
`Applications`.

The DMG is not an installer. Running the app directly from the mounted DMG can
work, but it is not the install flow.

The app is currently unsigned. On first launch macOS may block it. Use
right-click `Open` on `Codex Pets Desktop.app`, then confirm the launch.

## Install On Windows

Run the generated `.exe` installer from `release` or unpack the generated `.zip`.
The Windows build is unsigned, so SmartScreen may require manual confirmation on
first launch.

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
