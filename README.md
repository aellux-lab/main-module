# Aellux

Aellux is a lightweight, modular library for building better browser interfaces through declarative HTML attributes, adaptive CSS classes, and focused UX modules.

Instead of coupling interface behavior to a framework or filling markup with imperative JavaScript, Aellux lets the document describe the experience it needs. The runtime observes those declarations, loads the relevant modules, and keeps the interface synchronized with its available space and navigation state.

## Why Aellux?

Browser UX is made of several independent concerns: adapting layouts to available space, preserving interface state during navigation, remembering user preferences, loading content, and coordinating interactive components. Aellux treats each concern as a focused UX module instead of combining every behavior into a single runtime.

- **Adaptive composition** Measures containers and exposes spatial information to CSS;
- **State navigation** maintains continuity across history entries and URL changes;
- **Persistence** retains interface choices;
- additional modules can provide their own declarative behaviors. Pages load only the capabilities selected in `Aellux.options.load`.

The library is designed around three complementary layers:

- **Attributes** declare the UX behaviors requested by the document.
- **Classes** expose state that CSS can use to present those behaviors.
- **Modules** implement separate UX responsibilities behind those declarations.

This separation keeps markup readable, CSS expressive, and JavaScript focused. It also allows each UX module to evolve independently without making adaptive composition—or any other feature—the center of the entire library.

## Current Features

- Declarative activation through `data-aellux-*` attributes.
- Container-aware adaptive classes powered by `ResizeObserver`.
- Shape detection for vertical, square, and horizontal spaces.
- Configurable size classes from compact through ultrawide.
- Adaptive tab composition with ARIA state and persisted selection.
- Browser history and URL hash synchronization for interface snapshots.
- Local and session persistence helpers.
- Dynamically loaded UX modules with optional module preloading.
- Read/update layout scheduling to reduce layout thrashing.
- Native light and dark color-scheme support.

## Quick Start

Load the bootstrap script and initialize Aellux after it:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>My Aellux interface</title>

    <script src="./aellux.js"></script>
    <script>
      Aellux.init({
        defaultAdaptiveCSS: true
      });
    </script>
  </head>
  <body>
    <!-- Your interface -->
  </body>
</html>
```

The bootstrap automatically loads the modern ESM runtime and the modules listed in `Aellux.options.load`.

## Adaptive Composition

Add `data-aellux-adaptive` to a container to make its composition react to the space it actually occupies:

```html
<main data-aellux-adaptive="tabs">
  <!-- Adaptive content -->
</main>
```

As the container changes, Aellux applies shape classes:

- `ux-shape-vertical`
- `ux-shape-square`
- `ux-shape-horizontal`

It also applies cumulative size classes when the container has enough space:

- `ux-fits-compact`
- `ux-fits-small`
- `ux-fits-medium`
- `ux-fits-large`
- `ux-fits-wide`
- `ux-fits-ultrawide`

Because these classes belong to the container rather than the viewport, child layouts can adapt correctly wherever they are placed.

## Declarative Tabs

Tabs are connected to their panels through `data-aellux-tab`. The attribute value must match the panel `id`:

```html
<main data-aellux-adaptive="tabs">
  <progress data-aellux-adaptive-progress></progress>

  <nav data-aellux-persist>
    <button data-aellux-tab="home">Home</button>
    <button data-aellux-tab="profile">Profile</button>
    <button data-aellux-tab="settings">Settings</button>
  </nav>

  <section id="home">Home content</section>
  <section id="profile">Profile content</section>
  <section id="settings">Settings content</section>
</main>
```

Aellux assigns the tab roles, selection state, keyboard focus state, and panel visibility classes. The selected tab is stored in `sessionStorage` by default when `data-aellux-persist` is present.

Choose the persistence target explicitly when needed:

```html
<nav data-aellux-persist="local">
  <!-- Tabs -->
</nav>
```

Supported values are `session` and `local`.

## Configuration

Pass an options object to `Aellux.init()` to override the defaults:

```js
Aellux.init({
  defaultAdaptiveCSS: true,
  useHash: true,
  load: [
    "preferences",
    "state-navigation",
    "adaptive-composition",
    "adaptive-composition.tabs",
    "ajax-content",
    "components"
  ],
  adaptiveParams: {
    minSizes: {
      compact: 0,
      small: 480,
      medium: 768,
      large: 1024,
      wide: 1280,
      ultrawide: 1600
    },
    ratioShapes: {
      vertical: 0.8,
      horizontal: 1.25
    }
  }
});
```

Options are deeply merged with the library defaults, so only the values that need to change must be provided.

## Runtime API

The global `Aellux` object provides the main integration points:

```js
Aellux.on("Ready", handler);
Aellux.off("Ready", handler);
Aellux.dispatch("UpdateDOM", { detail: {} });

Aellux.persist.local.set("key", "value");
Aellux.persist.local.get("key", "fallback");

Aellux.persist.session.set("key", "value");
Aellux.persist.session.get("key", "fallback");
```

Custom events use the `Aellux` prefix. For example, `Aellux.on("Ready", handler)` listens for `AelluxReady`.

## Design Principles

- Prefer semantic, declarative HTML over imperative setup code.
- Adapt components to their own space, not only to the viewport.
- Keep behavior modular and load only the UX capabilities requested by the page.
- Build on browser standards such as ES modules, custom events, `ResizeObserver`, History API, and Web Storage.
- Preserve progressive enhancement by keeping the initial HTML meaningful.

## Browser Support

The current runtime targets modern browsers with support for:

- JavaScript modules
- Promises and async functions
- `ResizeObserver`
- Dynamic `import()`
- `URLSearchParams`

A legacy bootstrap path exists, but the legacy runtime is not implemented yet.

## Project Status

Aellux is under active development. Adaptive composition, tabs, persistence, and state-navigation foundations are present. Some modules, including preferences and asynchronous content, are currently placeholders and their APIs may evolve.

See [`examples/tabs.htm`](examples/tabs.htm) for a working markup example.
