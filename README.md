<p align="center"><img width="150" height="150" src="https://raw.githubusercontent.com/solidstarjs/solidstar/refs/heads/solid/assets/logo.png"></p>

# Solidstar

### Datastar with SolidJS reactivity.

Solidstar is an [almost](#comparison-with-datastar) drop-in replacement of [Datastar](https://github.com/starfederation/datastar/) with [Solid](https://github.com/solidjs/solid) reactivity under the hood, enabling interoperability between hypermedia-driven frontend logic and Solid components.

**[Quick Start](#quick-start) • [Stackblitz](https://stackblitz.com/github/solidstarjs/solidstar/tree/solid/template?file=index.tsx) • [Comparison](#comparison-with-datastar) •  [Guide](https://data-star.dev/guide) • [API Docs](https://data-star.dev/reference) • [Changelog](https://github.com/solidstarjs/solidstar/blob/solid/library/CHANGELOG.md) • [Discord](https://discord.gg/A9qH2xsb)**

## At a Glance

```tsx
// index.tsx
import { customElement } from "solid-element";
import { signals } from "solidstar";

customElement("my-counter", () => (
  <button onClick={() => signals.count++}>{signals.count}</button>
));
```

`index.html`
```html
<script type="module" src="index.tsx"></script>
<div data-signals-count="0" data-text="$count"></div>
<my-counter></my-counter>
```

> [!TIP]
> Try it out on [Stackblitz](https://stackblitz.com/github/solidstarjs/solidstar/tree/solid/template?file=index.tsx)!

## Quick Start

```bash
npx giget@latest gh:solidstarjs/solidstar/template#solid my-app
cd my-app
npm install
npm run dev
```

### CDN

> [!NOTE]  
> Use [Datastar](https://github.com/starfederation/datastar/) directly instead, if you do not need Solid components!

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/solidstarjs/solidstar@0.1.2/bundles/solidstar.js"></script>
```

### Customizing the bundle

Import `solidstar/core` instead of `solidstar` to optimize your bundle.

```tsx
export * from "solidstar/core";
import { load } from "solidstar/core";
import * as Plugins from "solidstar/plugins";

// Specify the plugins you want
load(
  Plugins.Class,
  Plugins.Signals, 
  Plugins.Text
);
```

> [!TIP]
> Try it out on https://bundlejs.com!

## Comparison with Datastar

| Subject                                                                                          | Datastar                                                                                                                  | Solidstar                                                                                                              |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Size (Gzipped)                                                                                   | 10.7 KiB                                                                                                                  | 14.7 KiB                                                                                                               |
| Solid interoperability                                                                           | ❌                                                                                                                         | ✅                                                                                                                      |
| Read & Write access to signals                                                                   | Use a [plugin](https://github.com/sudeep9/datastar-plugins?tab=readme-ov-file#datastar-signalsjs)                         | `import { signals } from "solidstar"`                                                                                  |
| Recommended component helpers                                                                    | ⏸️ Work-in-progress (ion)                                                                                                  | [Solid](https://docs.solidjs.com/), [Solid Element](https://github.com/solidjs/solid/tree/main/packages/solid-element) |
| Recommended install method                                                                       | No bundler, Local copy, CDN                                                                                               | [npm](https://www.npmjs.com/package/solidstar), **bundler required** for Solid components                              |
| Bundle customization                                                                             | 💲 [Bundler](https://data-star.dev/reference/datastar_pro#bundler)                                                         | [Learn how](#customizing-the-bundle)                                                                                   |
| Advanced debugging tool                                                                          | 💲 [Datastar Inspector](https://data-star.dev/reference/datastar_pro#datastar-inspector) <br /> *Optimized for hypermedia* | [Solid Developer Tools](https://github.com/thetarnav/solid-devtools) <br />*Optimized for Solid components*            |
| Latest signals technology                                                                        | ✅ (Alien signals)                                                                                                         | ⏸️ [Work-in-progress](https://github.com/solidjs/signals)                                                               |
| Computed's run lazily                                                                            | ✅                                                                                                                         | ❌                                                                                                                      |
| Supports [data-on-signal-patch](https://data-star.dev/reference/attributes#data-on-signal-patch) | ✅                                                                                                                         | ❌ (Currently)                                                                                                          |
| Optimized for MPAs                                                                               | ✅                                                                                                                         | ❌                                                                                                                      |


### Differences when accessing undefined signals

Solidstar's `signals` object is based on Solid's [createMutable](https://docs.solidjs.com/reference/store-utilities/create-mutable). Accessing undefined signals behaves slightly different compared to Datastar's implementation:

| Code                 | Datastar     | Solidstar    |
| -------------------- | ------------ | ------------ |
| `$null`              | `""`         | `undefined`  |
| `$null.length`       | `0`          | Throws error |
| `$null.title.length` | Throws error | Throws error |

> [!TIP]
> Use the [optional chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining) operator to prevent errors when accessing optional signals:
> ```ts
> $null?.title?.length
> ```
