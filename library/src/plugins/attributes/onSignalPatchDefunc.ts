// Icon: material-symbols:change-circle-outline
// Slug: Runs an expression when signals are patched.
// Description: Runs an expression whenever one or more signals are patched.

import type { AttributePlugin } from '../../engine/types'

export const OnSignalPatch: AttributePlugin = {
  type: 'attribute',
  name: 'onSignalPatch',
  valReq: 'must',
  argNames: ['patch'],
  returnsValue: true,
  onLoad: ({ runtimeErr }) => {
    throw runtimeErr(`data-on-signal-patch is currently not supported!`)
  },
}
