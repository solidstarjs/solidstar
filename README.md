<p align="center"><img width="150" height="150" src="https://raw.githubusercontent.com/solidstarjs/solidstar/refs/heads/solid/assets/logo.png"></p>

# Solidstar

### Datastar with SolidJS reactivity.

Solidstar is an [almost](#differences--limitations) drop-in replacement of [Datastar](https://github.com/starfederation/datastar/) with [Solid](https://github.com/solidjs/solid) reactivity under the hood, enabling interoperability between hypermedia-driven frontend logic and Solid components.

## Comparison

| Feature                   | Datastar                                                                         | Solidstar                                                                            |
| ------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Size (Gzipped)            | 10.70 KiB                                                                        | 14.59 KiB                                                                            |
| JSX components            | ❌                                                                                | ✅ [Learn more](https://docs.solidjs.com/concepts/understanding-jsx)                  |
| Web components            | ⏸️ Proprietary, Work-in-progress (Rocket)                                         | ✅ [Solid Element](https://github.com/solidjs/solid/tree/main/packages/solid-element) |
| Latest signals technology | ✅ (Alien signals)                                                                | ⏸️ [Work-in-progress](https://github.com/solidjs/signals)                             |
| Optimized for MPAs        | ✅                                                                                | ❌                                                                                    |
| Bundler                   | 💲 [Proprietary](https://data-star.dev/reference/datastar_pro#bundler)            | ✅ vite, esbuild, etc.                                                                |
| Debugging tool            | 💲 [Proprietary](https://data-star.dev/reference/datastar_pro#datastar-inspector) | ✅ [Solid Developer Tools](https://github.com/thetarnav/solid-devtools)               |
| Available on npm          | ❌                                                                                | ✅                                                                                    |

## Differences / Limitations

- Solidstar currently does not support `data-on-signal-patch`.
- Datastar initializes undeclared signals with `""` on read. Solidstar instead just returns `undefined` for undeclared signals.

## Getting Started

Getting started is as easy as adding a single 14.59 KiB script tag to your HTML.

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/solidstarjs/solidstar@0.0.1/bundles/solidstar.js"></script>
```

Then start adding frontend reactivity using declarative <code>data-*</code> attributes.

```html
<input data-bind-title />
<div data-text="$title.toUpperCase()"></div>
<button data-on-click="@post('/endpoint')">Save</button>
```

Read the [Getting Started Guide »](https://data-star.dev/guide/getting_started)

Visit the [Datastar Website »](https://data-star.dev/)

Watch the [Videos »](https://www.youtube.com/@data-star)

Join the [Discord Server »](https://discord.gg/bnRNgZjgPh)

## Contributing

Read the [Contribution Guidelines »](https://github.com/starfederation/datastar/blob/develop/CONTRIBUTING.md)
