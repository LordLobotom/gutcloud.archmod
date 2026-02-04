import type { Session } from '@supabase/supabase-js'
import { supabase } from './client'

export async function getSession(): Promise<Session | null> {
  if (!supabase) return null
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    return null
  }
  return data.session
}

export function onAuthStateChange(callback: (session: Session | null) => void) {
  if (!supabase) return { unsubscribe: () => {} }
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })
  return data.subscription
}

export async function signInWithGoogle() {
  if (!supabase) throw new Error('Supabase not configured')
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  })
}

export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
}
