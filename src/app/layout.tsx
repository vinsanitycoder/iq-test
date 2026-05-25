import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import { createAdminClient } from '@/lib/supabase/admin'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-nunito',
})

export async function generateMetadata(): Promise<Metadata> {
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('settings')
      .select('company_name, company_logo_url')
      .single()

    const title = data?.company_name
      ? `${data.company_name} — Applicant Test`
      : 'Applicant Logical Test'

    return {
      title,
      description: 'Cognitive aptitude assessment',
      icons: data?.company_logo_url
        ? { icon: data.company_logo_url }
        : undefined,
    }
  } catch {
    return {
      title: 'Applicant Logical Test',
      description: 'Cognitive aptitude assessment',
    }
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} font-nunito bg-fynlo-bg antialiased`}>
        {children}
      </body>
    </html>
  )
}
