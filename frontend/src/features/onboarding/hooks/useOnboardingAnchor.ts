/*
 * (C) Copyright 2026- ECMWF and individual contributors.
 *
 * This software is licensed under the terms of the Apache Licence Version 2.0
 * which can be obtained at http://www.apache.org/licenses/LICENSE-2.0.
 * In applying this licence, ECMWF does not waive the privileges and immunities
 * granted to it by virtue of its status as an intergovernmental organisation nor
 * does it submit to any jurisdiction.
 */

import { useEffect, useState } from 'react'

/**
 * First *visible* `[data-onboarding=…]` match and its viewport rect. Retries
 * via MutationObserver (page content renders async); visibility filtering
 * skips the hidden desktop/mobile duplicate.
 */
export function useOnboardingAnchor(selector: string): {
  element: Element | null
  rect: DOMRect | null
} {
  const [element, setElement] = useState<Element | null>(null)
  const [rect, setRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    const resolve = () => {
      const visible = Array.from(document.querySelectorAll(selector)).find(
        (candidate) => {
          const r = candidate.getBoundingClientRect()
          return r.width > 0 && r.height > 0
        },
      )
      // setState bails out when the reference is unchanged.
      setElement(visible ?? null)
    }

    resolve()
    const observer = new MutationObserver(resolve)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [selector])

  useEffect(() => {
    if (!element) {
      setRect(null)
      return
    }
    const update = () => setRect(element.getBoundingClientRect())
    update()
    const resizeObserver = new ResizeObserver(update)
    resizeObserver.observe(element)
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [element])

  return { element, rect }
}
