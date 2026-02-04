export type AuthMode = 'disabled' | 'optional' | 'required'
export type DataSource = 'local' | 'supabase'

function normalize<T extends string>(value: string | undefined, allowed: T[], fallback: T): T {
  if (!value) return fallback
  const lowered = value.toLowerCase() as T
  return allowed.includes(lowered) ? lowered : fallback
}

export const AUTH_MODE: AuthMode = normalize(
  process.env.NEXT_PUBLIC_AUTH_MODE,
  ['disabled', 'optional', 'required'],
  'optional'
)

export const DATA_SOURCE: DataSource = normalize(
  process.env.NEXT_PUBLIC_DATA_SOURCE,
  ['local', 'supabase'],
  'local'
)

export const ENABLE_SAMPLE_DATA =
  (process.env.NEXT_PUBLIC_ENABLE_SAMPLE_DATA ?? 'true').toLowerCase() !== 'false'

export const IS_AUTH_ENABLED = AUTH_MODE !== 'disabled'
export const IS_AUTH_REQUIRED = AUTH_MODE === 'required'
