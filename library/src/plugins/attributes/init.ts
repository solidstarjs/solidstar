// Icon: material-symbols:timer-play-outline
// Slug: Runs an expression when loaded into the DOM.
// Description: Runs an expression when the element is loaded into the DOM.

import { attribute } from '@engine'
import { batch } from '@engine/signals'
import { tagToMs } from '@utils/tags'
import { delay } from '@utils/timing'
import { modifyViewTransition } from '@utils/view-transitions'

attribute({
  name: 'init',
  requirement: {
    key: 'denied',
    value: 'must',
  },
  apply({ rx, mods }) {
    let callback = () => {
      batch(rx)
    }
    callback = modifyViewTransition(callback, mods)
    let wait = 0
    const delayArgs = mods.get('delay')
    if (delayArgs) {
      wait = tagToMs(delayArgs)
      if (wait > 0) {
        callback = delay(callback, wait)
      }
    }
    callback()
  },
})
