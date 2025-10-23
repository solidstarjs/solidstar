import type {
  Computed,
  Effect,
  JSONPatch,
  MergePatchArgs,
  Paths,
  Signal,
  SignalFilterOptions,
  Signals,
} from '@engine/types'
import { isPojo, pathToObj } from '@utils/paths'
import { hasOwn } from '@utils/polyfills'
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
import { NO_SUPPORT } from './consts'

const warnNoSupport = () => NO_SUPPORT

/** @deprecated */
export const beginBatch = warnNoSupport

/** @deprecated */
export const endBatch = warnNoSupport

/** @deprecated */
export const startPeeking = warnNoSupport

/** @deprecated */
export const stopPeeking = warnNoSupport

export { batch }

export const peek = untrack

export const signal = <T>(initialValue?: T): Signal<T> => {
  let prevComparison = true;
  const [get,set] = createSignal(initialValue, { equals: (prev, next) => {
    prevComparison = prev === next;
    return prevComparison;
  }});

  return ((...value: any[]) => {
    if (value.length) {
      set(value[0]);
      return !prevComparison;
    }
    
    return get();     
  }) as any;
}

const owner = createRoot(getOwner)!
owner.name = 'Solidstar'

// TODO: Maybe implement dispose for these, currently the computation runs no matter if it is used
// But with Solid v2 memos will be lazy anyway, so we kinda can just wait for v2 instead...
export const computed = <T>(getter: (previousValue?: T) => T): Computed<T> => {
  return runWithOwner(owner, () => {
    const result = createMemo(getter)
    ;(result as any)[$COMPUTED] = true
    return result
  })!
}
const $COMPUTED = Symbol('computed')

export const effect = (fn: () => void): Effect => {
  return createRoot((dispose) => {
    createEffect(() => fn())
    return dispose
  }, owner)
}

export const getPath = <T = any>(path: string): T | undefined => {
  let result = root
  const split = path.split('.')
  for (const path of split) {
    if (result == null || !hasOwn(result, path)) {
      return
    }
    result = result[path]
  }
  return result as T
}

const deep = createMutable

/*
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

export const mergePatch = (
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

export const mergePaths = (paths: Paths, options?: MergePatchArgs): void =>
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
        hasOwn(targetParent, target) &&
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
  } else if (!(ifMissing && hasOwn(targetParent, target))) {
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

const toRegExp = (val: string | RegExp): RegExp =>
  typeof val === 'string' ? RegExp(val.replace(/^\/|\/$/g, '')) : val

/**
 * Filters the root store based on an include and exclude RegExp
 *
 * @returns The filtered object
 */
export const filtered = (
  { include = /.*/, exclude = /(?!)/ }: SignalFilterOptions = {},
  obj: JSONPatch = root,
): Record<string, any> => {
  const includeRe = toRegExp(include)
  const excludeRe = toRegExp(exclude)
  const paths: Paths = []
  const stack: [any, string][] = [[obj, '']]

  while (stack.length) {
    const [node, prefix] = stack.pop()!

    for (const key in node) {
      const path = prefix + key
      if (isPojo(node[key])) {
        stack.push([node[key], `${path}.`])
      } else if (includeRe.test(path) && !excludeRe.test(path)) {
        paths.push([path, getPath(path)])
      }
    }
  }

  return pathToObj(paths)
}

export const root: Signals = runWithOwner(owner, () =>
  deep({}, { name: 'signals' }),
)!
export const signals = root
