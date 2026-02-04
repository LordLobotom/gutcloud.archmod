export function createId(prefix: string) {
  const rand = Math.random().toString(36).slice(2, 7)
  return `${prefix}-${Date.now().toString(36)}-${rand}`
}

export function parseCommaList(value: string): string[] {
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

export function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}
