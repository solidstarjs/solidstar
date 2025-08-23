<p align="center"><img width="150" height="150" src="https://raw.githubusercontent.com/solidstarjs/solidstar/refs/heads/solid/assets/logo.png"></p>

# Solidstar

### Datastar with SolidJS reactivity.

Solidstar is an [almost](#differences--limitations) drop-in replacement of [Datastar](https://github.com/starfederation/datastar/) with [Solid](https://github.com/solidjs/solid) reactivity under the hood, enabling interoperability between hypermedia-driven frontend logic and Solid components. Learn more about the differences in the [comparison](#comparison-with-datastar).

**[Quick Start](#quick-start) • [Stackblitz](https://stackblitz.com/github/solidstarjs/solidstar/tree/solid/template?file=index.tsx) • [npm](https://www.npmjs.com/package/solidstar) • [Guide](https://data-star.dev/guide) • [API Docs](https://data-star.dev/reference) • [Changelog](https://github.com/solidstarjs/solidstar/blob/solid/library/CHANGELOG.md) • [Discord](https://discord.gg/A9qH2xsb)**

## At a Glance

```tsx
index.tsx:

import { customElement } from "solid-element";
import { signals } from "solidstar";

customElement("my-counter", () => (
  <button onClick={() => signals.count++}>{signals.count}</button>
));
```

```html
index.html:

<script type="module" src="index.tsx"></script>
<div data-signals-count="0" data-text="$count"></div>
<my-counter></my-counter>
```

Try it out in [Stackblitz](https://stackblitz.com/github/solidstarjs/solidstar/tree/solid/template?file=index.tsx)!

## Quick Start

```bash
npx giget@latest gh:solidstarjs/solidstar/template#solid my-app
cd my-app
npm install
npm run dev
```

### CDN

> [!WARNING]  
> Use [Datastar](https://github.com/starfederation/datastar/) directly instead, if you do not need Solid components!

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/solidstarjs/solidstar@0.1.0/bundles/solidstar.js"></script>
```

## Comparison with Datastar

|                                                                                                  | Datastar                                                                                                         | Solidstar                                                                                                              |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Size (Gzipped)                                                                                   | 10.7 KiB                                                                                                         | 14.7 KiB                                                                                                               |
| Solid interoperability                                                                           | ❌                                                                                                                | ✅                                                                                                                      |
| Read & Write access to signals                                                                   | Use a [plugin](https://github.com/sudeep9/datastar-plugins?tab=readme-ov-file#datastar-signalsjs)                | `import { signals } from "solidstar"`                                                                                  |
| Latest signals technology                                                                        | ✅ (Alien signals)                                                                                                | ⏸️ [Work-in-progress](https://github.com/solidjs/signals)                                                               |
| Supports [data-on-signal-patch](https://data-star.dev/reference/attributes#data-on-signal-patch) | ✅                                                                                                                | ❌ (Currently)                                                                                                          |
| Optimized for MPAs                                                                               | ✅                                                                                                                | ❌                                                                                                                      |
| Recommended component helpers                                                                    | ⏸️ Work-in-progress (ion)                                                                                         | [Solid](https://docs.solidjs.com/), [Solid Element](https://github.com/solidjs/solid/tree/main/packages/solid-element) |
| Visual online bundler                                                                            | 💲 [Proprietary](https://data-star.dev/reference/datastar_pro#bundler)                                            | ❌ vite, esbuild, etc.                                                                                                  |
| Advanced debugging tool                                                                          | 💲 [Proprietary](https://data-star.dev/reference/datastar_pro#datastar-inspector) <br /> Optimized for hypermedia | [Solid Developer Tools](https://github.com/thetarnav/solid-devtools) <br />Optimized for Solid components              |
| Available on npm                                                                                 | ❌ (Do it yourself)                                                                                               | ✅ [npm](https://www.npmjs.com/package/solidstar)                                                                       |

### Differences / Limitations

- Datastar initializes undeclared signals with `""` on read. Solidstar instead just returns `undefined` for undeclared signals.
