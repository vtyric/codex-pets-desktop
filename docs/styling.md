# Styling

The project uses SCSS for all layout and styling.

Inline styles are not allowed.

Hardcoded design values are not allowed in component SCSS.

Shared values must live in SCSS variables.

## SCSS variables path

Shared SCSS files live here:

```text
apps/pet-overlay/src/styles
```

Base files:

```text
apps/pet-overlay/src/styles
├── _variables.scss
├── _mixins.scss
├── _z-index.scss
└── _animations.scss
```

## Nx Angular setup

`apps/pet-overlay/project.json` must include the shared styles path in the build target.

```json
{
  "targets": {
    "build": {
      "options": {
        "stylePreprocessorOptions": {
          "includePaths": ["apps/pet-overlay/src/styles"]
        }
      }
    }
  }
}
```

After this, component SCSS files can import shared files without relative paths.

```scss
@use 'variables' as *;
@use 'z-index' as *;
@use 'mixins' as *;
```

## Variables

Use variables for:

– colors

– sizes

– spacing

– radius

– z-index

– shadows

– animation durations

– breakpoints

Example:

```scss
$color-background-transparent: transparent;
$color-ui-surface: rgba(24, 24, 27, 0.92);
$color-ui-text: #f4f4f5;

$spacing-sm: 8px;
$spacing-md: 12px;
$spacing-lg: 16px;

$radius-md: 10px;

$pet-window-width: 320px;
$pet-window-height: 360px;
$pet-size-md: 7.04rem;

$transition-base: 180ms ease;
```

## Component rule

Do not write this:

```scss
.pet {
  width: 160px;
  height: 160px;
  border-radius: 10px;
}
```

Write this:

```scss
@use 'variables' as *;

.pet {
  width: $pet-size-md;
  height: $pet-size-md;
  border-radius: $radius-md;
}
```

## Electron drag region

Drag regions must also use SCSS.

```scss
@mixin drag-region {
  -webkit-app-region: drag;
}

@mixin no-drag-region {
  -webkit-app-region: no-drag;
}
```

Usage:

```scss
@use 'mixins' as *;

.pet-window {
  @include drag-region;
}

.pet-button {
  @include no-drag-region;
}
```

## File placement

Global SCSS files live in:

```text
apps/pet-overlay/src/styles
```

Component SCSS files live next to the component.

```text
pet-view
├── pet-view.component.ts
├── pet-view.component.html
└── pet-view.component.scss
```

## Requirement

Every new visual value must be added to the shared SCSS layer first.

Components must use shared SCSS variables instead of local hardcoded design values.
