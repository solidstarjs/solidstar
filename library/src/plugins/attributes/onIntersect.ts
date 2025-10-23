// Icon: mdi-light:vector-intersection
// Slug: Runs an expression on intersection.
// Description: Runs an expression when the element intersects with the viewport.

import { attribute } from '@engine'
import { batch } from '@engine/signals'
import type { HTMLOrSVG } from '@engine/types'
import { modifyTiming } from '@utils/timing'
import { modifyViewTransition } from '@utils/view-transitions'

const once = new WeakSet<HTMLOrSVG>()

attribute({
  name: 'on-intersect',
  requirement: {
    key: 'denied',
    value: 'must',
  },
  apply({ el, mods, rx }) {
    let callback = () => {
      batch(rx)
    }
    callback = modifyViewTransition(callback, mods)
    callback = modifyTiming(callback, mods)
    const options = { threshold: 0 }
    if (mods.has('full')) {
      options.threshold = 1
    } else if (mods.has('half')) {
      options.threshold = 0.5
    }
    let observer: IntersectionObserver | null = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            callback()
            if (observer && once.has(el)) {
              observer.disconnect()
            }
          }
        }
      },
      options,
    )
    observer.observe(el)
    if (mods.has('once')) {
      once.add(el)
    }
    return () => {
      if (!mods.has('once')) {
        once.delete(el)
      }
      if (observer) {
        observer.disconnect()
        observer = null
      }
    }
  },
})
