import type { Modifiers } from '@engine/types'

export const kebab = (str: string): string =>
  str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([a-z])([0-9]+)/gi, '$1-$2')
    .replace(/([0-9]+)([a-z])/gi, '$1-$2')
    .toLowerCase()

export const camel = (str: string): string =>
  kebab(str).replace(/-./g, (x) => x[1].toUpperCase())

export const snake = (str: string): string => kebab(str).replace(/-/g, '_')

export const pascal = (str: string): string =>
  camel(str).replace(/(^.|(?<=\.).)/g, (x) => x[0].toUpperCase())

export const jsStrToObject = (raw: string) => {
  try {
    return JSON.parse(raw)
  } catch {
    // If JSON parsing fails, try to evaluate as a JavaScript object
    // This is less safe and should be used with caution
    return Function(`return (${raw})`)()
  }
}

const caseFns: Record<string, (s: string) => string> = {
  camel: (str) => str.replace(/-[a-z]/g, (x) => x[1].toUpperCase()),
  snake: (str) => str.replace(/-/g, '_'),
  pascal: (str) => str[0].toUpperCase() + caseFns.camel(str.slice(1)),
}

export const modifyCasing = (
  str: string,
  mods: Modifiers,
  defaultCase = 'camel',
): string => {
  for (const c of mods.get('case') || [defaultCase]) {
    str = caseFns[c]?.(str) || str
  }
  return str
}

export const ALIAS = typeof SOLIDSTAR_ALIAS !== 'undefined' ? SOLIDSTAR_ALIAS: undefined;
export const aliasify = (name: string) =>
  ALIAS ? `data-${ALIAS}-${name}` : `data-${name}`
