import type { Entity, Relationship } from '@/lib/types'

const STORAGE_KEY = 'archmod-data-v1'

export interface StoredData {
  entities: Entity[]
  relationships: Relationship[]
  updatedAt: string
}

export function loadLocalData(): StoredData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredData
  } catch {
    return null
  }
}

export function saveLocalData(entities: Entity[], relationships: Relationship[]) {
  if (typeof window === 'undefined') return
  const payload: StoredData = {
    entities,
    relationships,
    updatedAt: new Date().toISOString()
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // ignore storage errors
  }
}
