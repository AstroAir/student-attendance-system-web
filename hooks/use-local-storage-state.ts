"use client"

import * as React from "react"

type Options<T> = {
  serialize?: (value: T) => string
  deserialize?: (raw: string) => T
}

export function useLocalStorageState<T>(
  key: string,
  initialValue: T,
  options?: Options<T>
) {
  const serialize = React.useCallback(
    (v: T) => (options?.serialize ? options.serialize(v) : JSON.stringify(v)),
    [options]
  )

  const deserialize = React.useCallback(
    (raw: string) => (options?.deserialize ? options.deserialize(raw) : (JSON.parse(raw) as T)),
    [options]
  )

  const [value, setValue] = React.useState<T>(() => {
    if (typeof window === "undefined") return initialValue

    try {
      const raw = window.localStorage.getItem(key)
      if (raw == null) return initialValue
      return deserialize(raw)
    } catch {
      return initialValue
    }
  })

  React.useEffect(() => {
    try {
      window.localStorage.setItem(key, serialize(value))
    } catch {
      return
    }
  }, [key, serialize, value])

  return [value, setValue] as const
}
