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
<div data-signals:count="0" data-text="$count"></div>
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
<script type="module" src="https://cdn.jsdelivr.net/gh/solidstarjs/solidstar@0.3.0/bundles/solidstar.js"></script>
```

## Customizing the bundle

To optimize the bundle, import `solidstar/core` instead of `solidstar` and import the plugins of your choice:

```ts
export * from "solidstar/core";
import "solidstar/plugins/attributes/class";
import "solidstar/plugins/attributes/signals";
import "solidstar/plugins/attributes/text";
import "solidstar/plugins/watchers/patchElements";
import "solidstar/plugins/watchers/patchSignals";
```

> [!TIP]
> Try it out on https://bundlejs.com!

### Setting a custom attribute alias

To use a custom [attribute alias](https://data-star.dev/reference/attributes#aliasing-attributes), define a global `SOLIDSTAR_ALIAS` constant in your bundler like so:

```ts
import { defineConfig } from "vite";

export default defineConfig({
  define: {
    // Use data-star-* instead of data-* attributes
    "SOLIDSTAR_ALIAS": "'star'"
  },
});
```

## Extending the signals type

You can use Typescript declaration merging, to declare available signals in your app.

```ts
declare module "solidstar" {
  interface Signals {
    count: number;
    optionalText?: string;
    foo: {
      bar: number;
    }
  }
}
```

## Comparison with Datastar

| Subject                                                                                          | Datastar                                                                                                                  | Solidstar                                                                                                              |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Size (Compressed)                                                                                | 10.76 KiB                                                                                                                 | 13.8 KiB                                                                                                               |
| Solid interoperability                                                                           | ❌                                                                                                                         | ✅                                                                                                                      |
| Extendable signals type                                                                          | ❌                                                                                                                         | [Learn how](#extending-the-signals-type)                                                                               |
| Recommended component helpers                                                                    | 💲 [Rocket](https://data-star.dev/reference/rocket)                                                  | [Solid](https://docs.solidjs.com/), [Solid Element](https://github.com/solidjs/solid/tree/main/packages/solid-element) |
| Recommended install method                                                                       | No bundlerrequired, use local copy or CDN link                                                                                               | [npm](https://www.npmjs.com/package/solidstar), **bundler required** for Solid components                              |
| Bundle customization                                                                             | 💲 [Bundler](https://data-star.dev/reference/datastar_pro#bundler)                                                         | [Learn how](#customizing-the-bundle)                                                                                   |
| Advanced debugging tool                                                                          | 💲 [Datastar Inspector](https://data-star.dev/reference/datastar_pro#datastar-inspector) <br /> *Optimized for hypermedia* | [Solid Developer Tools](https://github.com/thetarnav/solid-devtools) <br />*Optimized for Solid components*            |
| Latest signals technology                                                                        | ✅ (Variation of Alien signals)                                                                                                         | ⏸️ [Work-in-progress](https://github.com/solidjs/signals)                                                               |
| Computeds run lazily                                                                             | ✅                                                                                                                         | ❌                                                                                                                      |
| Supports [data-on-signal-patch](https://data-star.dev/reference/attributes#data-on-signal-patch) | ✅                                                                                                                         | ❌ (Currently)                                                                                                          |
| Optimized for MPAs                                                                               | ✅                                                                                                                         | ❌                                                                                                                      |

## Differences

### Accessing undefined signals

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

### Plugin API: beginBatch, endBatch

Solidstar does not support the `beginBatch` and `endBatch` plugin API functions, instead you have to use `batch`:

```ts
// Datastar
import { root, beginBatch, endBatch } from "/datastar.js";
beginBatch();
root.count = 1;
root.text = "hello world";
endBatch();

// Solidstar
import { root, batch } from "solidstar";
batch(() => {
  root.count = 1;
  root.text = "hello world";
});
```

### Plugin API: startPeeking, stopPeeking

Solidstar does not support the `startPeeking` and `stopPeeking` plugin API functions, instead you have to use `peek`:

```ts
// Datastar
import { root, startPeeking, stopPeeking } from "/datastar.js";
startPeeking();
console.log(root.count);
stopPeeking();

// Solidstar
import { root, peek } from "solidstar";
peek(() => {
  console.log(root.count);
});
```
