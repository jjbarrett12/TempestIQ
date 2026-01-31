'use client'

import { useEffect } from 'react'

/**
 * Scrolls to top on initial page load when the URL has no hash.
 * Fixes browser scroll restoration so the homepage doesn't open at the bottom.
 * Deep links like /marketing#pricing are left to the browser to handle.
 */
export function ScrollToTopOnLoad() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.location.hash) {
      window.history.scrollRestoration = 'manual'
      window.scrollTo(0, 0)
    }
  }, [])
  return null
}
