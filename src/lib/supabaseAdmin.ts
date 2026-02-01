/**
 * Supabase admin client - server only.
 * Uses service role key for full access to push tables.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let supabaseAdmin: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
    }
    supabaseAdmin = createClient(url, key, { auth: { persistSession: false } })
  }
  return supabaseAdmin
}
