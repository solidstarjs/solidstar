import { isHTMLOrSVG } from '../utils/dom'
import { isPojo, pathToObj } from '../utils/paths'
import { camel, snake } from '../utils/text'
import { DATASTAR, DSP, DSS } from './consts'
import { initErr, runtimeErr } from './errors'
import type {
  ActionPlugins,
  AttributePlugin,
  DatastarPlugin,
  HTMLOrSVG,
  InitContext,
  JSONPatch,
  MergePatchArgs,
  OnRemovalFn,
  Paths,
  RuntimeContext,
  RuntimeExpressionFunction,
  SignalFilterOptions,
} from './types'
import {
  createSignal,
  createMemo,
  createEffect,
  createRoot,
  untrack,
  batch,
  getOwner,
  runWithOwner,
} from 'solid-js'
import { createMutable } from 'solid-js/store'
import type { EffectFunction } from 'solid-js'

const owner = createRoot(getOwner)!
owner.name = 'Solidstar'

const peek = untrack
const signal = createSignal
// TODO: Maybe implement dispose for these, currently the computation runs no matter if it is used
// But with Solid v2 memos will be lazy anyway, so we kinda can just wait for v2 instead...
const computed = <T extends EffectFunction<any>>(fn: T) =>
  runWithOwner(owner, () => {
    const result = createMemo(fn)
    ;(result as any)[$COMPUTED] = true
    return result
  })!
const $COMPUTED = Symbol('computed')

const effect = <T extends EffectFunction<any>>(fn: T) =>
  createRoot((dispose) => {
    createEffect(fn)
    return dispose
  }, owner)

const getPath = <T = any>(path: string): T | undefined => {
  let result = root
  const split = path.split('.')
  for (const path of split) {
    if (result == null || !Object.hasOwn(result, path)) {
      return
    }
    result = result[path]
  }
  return result as T
}

const deep = createMutable

export const DELETE = Symbol('delete')

/*
const currentPatch: Paths = []
let batchDepth = 0
const dispatch = (path?: string, value?: any) => {
  if (path !== undefined && value !== undefined) {
    currentPatch.push([path, value])
  }
  if (!batchDepth && currentPatch.length) {
    const detail = pathToObj(currentPatch)
    currentPatch.length = 0
    document.dispatchEvent(
      new CustomEvent<JSONPatch>(DATASTAR_SIGNAL_PATCH_EVENT, {
        detail,
      }),
    )
  }
}
*/

let $NODE: any = undefined
const getNode = (target: any) => {
  $NODE ??= Object.getOwnPropertySymbols(target).find(
    (s) => s.description === 'store-node',
  )
  return target[$NODE]
}

const startBatch: any = () => {}
const endBatch: any = () => {}

const mergePatch = (
  patch: JSONPatch,
  { ifMissing }: MergePatchArgs = {},
): void => {
  batch(() => {
    for (const key in patch) {
      if (patch[key] == null) {
        if (!ifMissing) {
          delete root[key]
        }
      } else {
        mergeInner(patch[key], key, root, '', ifMissing)
      }
    }
  })
}

const mergePaths = (paths: Paths, options: MergePatchArgs = {}): void =>
  mergePatch(pathToObj(paths), options)

const mergeInner = (
  patch: any,
  target: string,
  targetParent: Record<string, any>,
  prefix: string,
  ifMissing: boolean | undefined,
): void => {
  if (isPojo(patch)) {
    if (
      !(
        Object.hasOwn(targetParent, target) &&
        (isPojo(targetParent[target]) || Array.isArray(targetParent[target]))
      )
    ) {
      targetParent[target] = {}
    }

    for (const key in patch) {
      if (patch[key] == null) {
        if (!ifMissing) {
          delete targetParent[target][key]
        }
      } else {
        mergeInner(
          patch[key],
          key,
          targetParent[target],
          `${prefix + target}.`,
          ifMissing,
        )
      }
    }
  } else if (!(ifMissing && Object.hasOwn(targetParent, target))) {
    if (typeof patch === 'function' && patch[$COMPUTED]) {
      // Delete underlying signal in Solid store and inform listeners
      // "delete targetParent[target]" is not good enough: https://github.com/solidjs/solid/issues/1559
      const node = getNode(targetParent)
      if (node[target] != null) {
        node[target].$()
        delete node[target]
      }

      // Computeds are deliberately readonly
      // Related chat in Datastar community:
      // https://discord.com/channels/1296224603642925098/1299058221390102528/1408523922818994227
      Object.defineProperty(targetParent, target, {
        get: patch,
        enumerable: true,
      })
    } else {
      targetParent[target] = patch
    }
  }
}

function filtered(
  { include = /.*/, exclude = /(?!)/ }: SignalFilterOptions = {},
  obj: JSONPatch = root,
): Record<string, any> {
  // We need to find all valid signal paths in the object
  const paths: Paths = []
  const stack: [any, string][] = [[obj, '']]

  while (stack.length) {
    const [node, prefix] = stack.pop()!

    for (const key in node) {
      const path = prefix + key
      if (isPojo(node[key])) {
        stack.push([node[key], `${path}.`])
      } else if (
        toRegExp(include).test(path) &&
        !toRegExp(exclude).test(path)
      ) {
        paths.push([path, getPath(path)])
      }
    }
  }

  return pathToObj(paths)
}

function toRegExp(val: string | RegExp): RegExp {
  if (typeof val === 'string') {
    return RegExp(val.replace(/^\/|\/$/g, ''))
  }

  return val
}

const root: Record<string, any> = runWithOwner(owner, () =>
  deep({}, { name: 'signals' }),
)!
export const signals = root

/**
 * Turn data-* attributes into reactive expressions
 * This is the core of the Datastar
 */

const actions: ActionPlugins = {}
const plugins: AttributePlugin[] = []
let pluginRegexs: RegExp[] = []

// Map of cleanup functions by element, keyed by a dataset key-value hash
const removals = new Map<HTMLOrSVG, Map<string, OnRemovalFn>>()

let mutationObserver: MutationObserver | null = null

let alias = ''
export function setAlias(value: string) {
  alias = value
}
export function aliasify(name: string) {
  return alias ? `data-${alias}-${name}` : `data-${name}`
}

export function load(...pluginsToLoad: DatastarPlugin[]) {
  for (const plugin of pluginsToLoad) {
    const ctx: InitContext = {
      plugin,
      actions,
      root,
      filtered,
      signal,
      computed,
      effect,
      mergePatch,
      mergePaths,
      peek,
      getPath,
      startBatch,
      endBatch,
      initErr: 0 as any,
    }
    ctx.initErr = initErr.bind(0, ctx)

    if (plugin.type === 'action') {
      actions[plugin.name] = plugin
    } else if (plugin.type === 'attribute') {
      plugins.push(plugin)
      plugin.onGlobalInit?.(ctx)
    } else if (plugin.type === 'watcher') {
      plugin.onGlobalInit?.(ctx)
    } else {
      throw ctx.initErr('InvalidPluginType')
    }
  }

  // Sort attribute plugins by descending length then alphabetically
  plugins.sort((a, b) => {
    const lenDiff = b.name.length - a.name.length
    if (lenDiff !== 0) return lenDiff
    return a.name.localeCompare(b.name)
  })

  pluginRegexs = plugins.map((plugin) => RegExp(`^${plugin.name}([A-Z]|_|$)`))
}

function applyEls(els: Iterable<HTMLOrSVG>): void {
  const ignore = `[${aliasify('ignore')}]`
  for (const el of els) {
    if (!el.closest(ignore)) {
      for (const key in el.dataset) {
        applyAttributePlugin(el, key, el.dataset[key]!)
      }
    }
  }
}

function cleanupEls(els: Iterable<HTMLOrSVG>): void {
  for (const el of els) {
    const cleanups = removals.get(el)
    // If removals has el, delete it and run all cleanup functions
    if (removals.delete(el)) {
      for (const cleanup of cleanups!.values()) {
        cleanup()
      }
      cleanups!.clear()
    }
  }
}

// Apply all plugins to the entire DOM or a provided element
export function apply(root: HTMLOrSVG = document.body) {
  // Delay applying plugins to give custom plugins a chance to load
  queueMicrotask(() => {
    applyEls([root])
    applyEls(root.querySelectorAll<HTMLOrSVG>('*'))

    // Monitor the entire document body or a provided element for changes
    // https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe
    if (!mutationObserver) {
      mutationObserver = new MutationObserver(observe)
      mutationObserver.observe(root, {
        subtree: true,
        childList: true,
        attributes: true,
      })
    }
  })
}

function applyAttributePlugin(
  el: HTMLOrSVG,
  attrKey: string,
  value: string,
): void {
  if (attrKey.startsWith(alias)) {
    const rawKey = camel(alias ? attrKey.slice(alias.length) : attrKey)
    const plugin = plugins.find((_, i) => pluginRegexs[i].test(rawKey))
    if (plugin) {
      // Extract the key and modifiers
      let [key, ...rawModifiers] = rawKey.slice(plugin.name.length).split(/__+/)

      const hasKey = !!key
      if (hasKey) {
        key = camel(key)
      }
      const hasValue = !!value

      // Create the runtime context
      const ctx: RuntimeContext = {
        plugin,
        actions,
        root,
        filtered,
        signal,
        computed,
        effect,
        mergePatch,
        mergePaths,
        peek,
        getPath,
        startBatch,
        endBatch,
        initErr: 0 as any,
        el,
        rawKey,
        key,
        value,
        mods: new Map(),
        runtimeErr: 0 as any,
        rx: 0 as any,
      }
      ctx.initErr = initErr.bind(0, ctx)
      ctx.runtimeErr = runtimeErr.bind(0, ctx)
      if (
        plugin.shouldEvaluate === undefined ||
        plugin.shouldEvaluate === true
      ) {
        ctx.rx = generateReactiveExpression(ctx)
      }

      // Check the requirements
      const keyReq = plugin.keyReq || 'allowed'
      if (hasKey) {
        if (keyReq === 'denied') {
          throw ctx.runtimeErr(`${plugin.name}KeyNotAllowed`)
        }
      } else if (keyReq === 'must') {
        throw ctx.runtimeErr(`${plugin.name}KeyRequired`)
      }

      const valReq = plugin.valReq || 'allowed'
      if (hasValue) {
        if (valReq === 'denied') {
          throw ctx.runtimeErr(`${plugin.name}ValueNotAllowed`)
        }
      } else if (valReq === 'must') {
        throw ctx.runtimeErr(`${plugin.name}ValueRequired`)
      }

      // Check for exclusive requirements
      if (keyReq === 'exclusive' || valReq === 'exclusive') {
        if (hasKey && hasValue) {
          throw ctx.runtimeErr(`${plugin.name}KeyAndValueProvided`)
        }
        if (!hasKey && !hasValue) {
          throw ctx.runtimeErr(`${plugin.name}KeyOrValueRequired`)
        }
      }

      for (const rawMod of rawModifiers) {
        const [label, ...mod] = rawMod.split('.')
        ctx.mods.set(camel(label), new Set(mod.map((t) => t.toLowerCase())))
      }

      const cleanup = plugin.onLoad(ctx)
      if (cleanup) {
        let cleanups = removals.get(el)
        if (cleanups) {
          cleanups.get(rawKey)?.()
        } else {
          cleanups = new Map()
          removals.set(el, cleanups)
        }
        cleanups.set(rawKey, cleanup)
      }
    }
  }
}

// Set up a mutation observer to run plugin removal and apply functions
function observe(mutations: MutationRecord[]) {
  const ignore = `[${aliasify('ignore')}]`

  for (const {
    target,
    type,
    attributeName,
    addedNodes,
    removedNodes,
  } of mutations) {
    if (type === 'childList') {
      for (const node of removedNodes) {
        if (isHTMLOrSVG(node)) {
          cleanupEls([node])
          cleanupEls(node.querySelectorAll<HTMLOrSVG>('*'))
        }
      }

      for (const node of addedNodes) {
        if (isHTMLOrSVG(node)) {
          applyEls([node])
          applyEls(node.querySelectorAll<HTMLOrSVG>('*'))
        }
      }
    } else if (type === 'attributes') {
      // If el has a parent with data-ignore, skip it
      if (isHTMLOrSVG(target) && !target.closest(ignore)) {
        const key = camel(attributeName!.slice(5))
        const value = target.getAttribute(attributeName!)
        if (value === null) {
          const cleanups = removals.get(target)
          if (cleanups) {
            cleanups.get(key)?.()
            cleanups.delete(key)
          }
        } else {
          applyAttributePlugin(target, key, value)
        }
      }
    }
  }
}

function generateReactiveExpression(
  ctx: RuntimeContext,
): RuntimeExpressionFunction {
  let expr = ''

  const attrPlugin = (ctx.plugin as AttributePlugin) || undefined

  // plugin is guaranteed to be an attribute plugin
  if (attrPlugin?.returnsValue) {
    // This regex allows Datastar expressions to support nested
    // regex and strings that contain ; without breaking.
    //
    // Each of these regex defines a block type we want to match
    // (importantly we ignore the content within these blocks):
    //
    // regex            \/(\\\/|[^\/])*\/
    // double quotes      "(\\"|[^\"])*"
    // single quotes      '(\\'|[^'])*'
    // ticks              `(\\`|[^`])*`
    // iife               \(\s*((function)\s*\(\s*\)|(\(\s*\))\s*=>)\s*(?:\{[\s\S]*?\}|[^;)\{]*)\s*\)\s*\(\s*\)
    //
    // The iife support is (intentionally) limited. It only supports
    // function and arrow syntax with no arguments, and no nested IIFEs.
    //
    // We also want to match the non delimiter part of statements
    // note we only support ; statement delimiters:
    //
    // [^;]
    //
    const statementRe =
      /(\/(\\\/|[^/])*\/|"(\\"|[^"])*"|'(\\'|[^'])*'|`(\\`|[^`])*`|\(\s*((function)\s*\(\s*\)|(\(\s*\))\s*=>)\s*(?:\{[\s\S]*?\}|[^;){]*)\s*\)\s*\(\s*\)|[^;])+/gm
    const statements = ctx.value.trim().match(statementRe)
    if (statements) {
      const lastIdx = statements.length - 1
      const last = statements[lastIdx].trim()
      if (!last.startsWith('return')) {
        statements[lastIdx] = `return (${last});`
      }
      expr = statements.join(';\n')
    }
  } else {
    expr = ctx.value.trim()
  }

  // Replace signal references with bracket notation
  // Examples:
  //   $count          → $['count']
  //   $count--        → $['count']--
  //   $count++        → $['count']++
  //   $count += 5     → $['count'] += 5
  //   $foo = 5        → $['foo'] = 5
  //   $foo.bar        → $['foo']['bar']
  //   $foo-bar        → $['foo-bar']
  //   $foo.bar-baz    → $['foo']['bar-baz']
  //   $foo-$bar       → $['foo']-$['bar']
  //   $arr[$index]    → $['arr'][$['index']]
  //   $['foo']        → $['foo']
  //   $foo[obj.bar]   → $['foo'][obj.bar]
  //   $foo['bar.baz'] → $['foo']['bar.baz']
  //   $1              → $['1']
  //   $123            → $['123']
  //   $foo.0.name     → $['foo']['0']['name']
  //   $foo.0.1.2.bar.0 → $['foo']['0']['1']['2']['bar']['0']

  // Transform all signal patterns
  expr = expr
    // $['x'] → $x (normalize existing bracket notation)
    .replace(/\$\['([a-zA-Z_$\d][\w$]*)'\]/g, '$$$1')
    // $x → $['x'] (including dots and hyphens)
    .replace(/\$([a-zA-Z_\d]\w*(?:[.-]\w+)*)/g, (_, signalName) => {
      const parts = signalName.split('.')
      return parts.reduce(
        (acc: string, part: string) => `${acc}['${part}']`,
        '$',
      )
    })
    // $ inside brackets: [$x] → [$['x']]
    .replace(
      /\[(\$[a-zA-Z_\d]\w*)\]/g,
      (_, varName) => `[$['${varName.slice(1)}']]`,
    )

  // Ignore any escaped values
  const escaped = new Map<string, string>()
  const escapeRe = RegExp(`(?:${DSP})(.*?)(?:${DSS})`, 'gm')
  let counter = 0
  for (const match of expr.matchAll(escapeRe)) {
    const k = match[1]
    const v = `dsEscaped${counter++}`
    escaped.set(v, k)
    expr = expr.replace(DSP + k + DSS, v)
  }

  const nameGen = (prefix: string, name: string) => {
    return `${prefix}${snake(name).replaceAll(/\./g, '_')}`
  }

  // Replace any action calls
  const actionsCalled = new Set<string>()
  const actionsRe = RegExp(`@(${Object.keys(actions).join('|')})\\(`, 'gm')
  const actionMatches = [...expr.matchAll(actionsRe)]
  const actionNames = new Set<string>()
  const actionFns = new Set<(...args: any[]) => any>()
  if (actionMatches.length) {
    const actionPrefix = `${DATASTAR}Act_`
    for (const match of actionMatches) {
      const actionName = match[1]
      const action = actions[actionName]
      if (!action) {
        continue
      }
      actionsCalled.add(actionName)

      const name = nameGen(actionPrefix, actionName)

      // Add ctx to action calls
      expr = expr.replace(`@${actionName}(`, `${name}(`)
      actionNames.add(name)
      actionFns.add((...args: any[]) => action.fn(ctx, ...args))
    }
  }

  // Replace any escaped values
  for (const [k, v] of escaped) {
    expr = expr.replace(k, v)
  }

  ctx.fnContent = expr

  try {
    const fn = Function(
      'el',
      '$',
      ...(attrPlugin?.argNames || []),
      ...actionNames,
      expr,
    )
    return (...args: any[]) => {
      try {
        return fn(ctx.el, root, ...args, ...actionFns)
      } catch (e: any) {
        throw ctx.runtimeErr('ExecuteExpression', {
          error: e.message,
        })
      }
    }
  } catch (error: any) {
    throw ctx.runtimeErr('GenerateExpression', {
      error: error.message,
    })
  }
}
