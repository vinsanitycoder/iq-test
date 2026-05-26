import { redirect } from 'next/navigation'
import { validatePersonalityCookie } from '@/lib/personality/session-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import WelcomeClient from '@/components/personality/WelcomeClient'

export const dynamic = 'force-dynamic'

export default async function PersonalityWelcomePage() {
  const auth = await validatePersonalityCookie()
  if (!auth) redirect('/personality/invalid')

  const { invite, session } = auth

  // Live expiry check
  if (new Date(invite.expires_at).getTime() < Date.now()) {
    redirect('/personality/expired')
  }

  // Already completed — send to complete page
  if (session?.status === 'completed') {
    redirect('/personality/complete')
  }

  // Fetch applicant's first name
  const admin = createAdminClient()
  const { data: applicant } = await admin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from('applicants' as any)
    .select('first_name')
    .eq('id', invite.applicant_id)
    .single<{ first_name: string }>()

  const deadline = new Date(invite.expires_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <WelcomeClient
      firstName={applicant?.first_name ?? 'there'}
      deadline={deadline}
      hasStarted={session?.status === 'in_progress'}
    />
  )
}
