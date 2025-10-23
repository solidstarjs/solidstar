// Icon: material-symbols:change-circle-outline
// Slug: Runs an expression when signals are patched.
// Description: Runs an expression whenever one or more signals are patched.

import { attribute } from '@engine'
import { DATASTAR_SIGNAL_PATCH_EVENT } from '@engine/consts'
import { beginBatch, endBatch, filtered } from '@engine/signals'
import type { JSONPatch, SignalFilterOptions } from '@engine/types'
import { isEmpty } from '@utils/paths'
import { jsStrToObject } from '@utils/text'
import { modifyTiming } from '@utils/timing'

attribute({
  name: 'on-signal-patch',
  requirement: {
    value: 'must',
  },
  argNames: ['patch'],
  returnsValue: true,
  apply({ el, key, mods, rx, error }) {
    if (!!key && key !== 'filter') {
      throw error('KeyNotAllowed')
    }

    // Look for data-on-signal-patch-filter data attribute
    const filtersRaw = el.getAttribute('data-on-signal-patch-filter')
    let filters: SignalFilterOptions = {}
    if (filtersRaw) {
      filters = jsStrToObject(filtersRaw)
    }

    const callback: EventListener = modifyTiming(
      (evt: CustomEvent<JSONPatch>) => {
        const watched = filtered(filters, evt.detail)
        if (!isEmpty(watched)) {
          beginBatch()
          rx(watched)
          endBatch()
        }
      },
      mods,
    )

    document.addEventListener(DATASTAR_SIGNAL_PATCH_EVENT, callback)
    return () => {
      document.removeEventListener(DATASTAR_SIGNAL_PATCH_EVENT, callback)
    }
  },
})
