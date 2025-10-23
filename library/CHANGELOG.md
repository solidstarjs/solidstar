# solidstar

## 0.3.0

### Minor Changes

- 697f211: The `signal` API now uses the same interface as in Datastar.
- 799dea9: Upgraded the core to Datastar [v1.0.0-RC.6](https://github.com/starfederation/datastar/releases/tag/v1.0.0-RC.6).

## 0.2.2

### Patch Changes

- 502b6ca: Fixed actions throwing an `xyz is not a function` error in `data-effect`.

## 0.2.1

### Patch Changes

- 0e79e3e: The `FetchArgs` type can now be imported via `solidstar/plugins`.

## 0.2.0

### Minor Changes

- 6298388: The `signals` object can now be typed via declaration merging.

## 0.1.2

### Patch Changes

- eead9e5: Fixed a bug that prevented computed from being assigned with minified code.

## 0.1.1

### Patch Changes

- e5097ff: Functions can now be assigned to signals.
- c3d39a3: Fixed an error when using backend actions with multipart forms.
- 133f518: Fixed assigning a computed to an already existing signal ([test](https://data-star.dev/tests/computed_assign)).

## 0.1.0

### Minor Changes

- 60e89a3: Replaced the reactivity engine with SolidJS and exported the signals root object as `signals`.
