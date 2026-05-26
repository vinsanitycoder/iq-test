import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Server-side auth guard for all protected HR routes.
// Runs in Node.js runtime — no Edge Runtime incompatibilities.
// The login page lives outside this route group and is always public.
export default async function HRProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/hr/login')
  }
  return <>{children}</>
}
