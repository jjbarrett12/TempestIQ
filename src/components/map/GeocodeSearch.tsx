'use client'

import { useState, useCallback, useRef } from 'react'
import { geocodeAddress, type GeocodeResult } from '@/lib/map/geocode'

function useDebounced<A extends unknown[]>(fn: (...args: A) => void, ms: number): (...args: A) => void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  return useCallback(
    (...args: A) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        fn(...args)
        timerRef.current = null
      }, ms)
    },
    [fn, ms]
  )
}

export interface GeocodeSearchProps {
  onSelect: (result: GeocodeResult) => void
  placeholder?: string
  className?: string
}

export function GeocodeSearch({ onSelect, placeholder = 'Search address…', className = '' }: GeocodeSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeocodeResult[]>([])
  const [loading, setLoading] = useState(false)

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const list = await geocodeAddress(q, { limit: 5 })
      setResults(list)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const debouncedSearch = useDebounced(search, 400)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    debouncedSearch(value)
  }

  const handleSelect = (r: GeocodeResult) => {
    onSelect(r)
    setQuery(r.displayName)
    setResults([])
  }

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => query && search(query)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
          Searching…
        </div>
      )}
      {results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg py-1 max-h-48 overflow-auto">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => handleSelect(r)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50"
              >
                {r.displayName}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
