// Icon: material-symbols:change-circle-outline
// Slug: Runs an expression when signals are patched.
// Description: Runs an expression whenever one or more signals are patched.

import { attribute } from '@engine'
import { NO_SUPPORT } from '@engine/consts'

attribute({
  name: 'on-signal-patch',
  requirement: {
    value: 'must',
  },
  argNames: ['patch'],
  returnsValue: true,
  apply({ error }) {
    throw error(NO_SUPPORT)
  },
})
