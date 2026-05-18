import Link from 'next/link'
import LogoutButton from './LogoutButton'

export default function HRNav() {
  return (
    <header className="bg-fynlo-dark text-white px-4 sm:px-6 py-4 flex items-center justify-between">
      <Link href="/hr" className="flex items-center gap-3">
        <span className="text-fynlo-teal font-black text-xl tracking-tight">Fynlo</span>
        <span className="text-white/30">|</span>
        <span className="font-semibold text-white/70 text-sm">HR Dashboard</span>
      </Link>
      <div className="flex items-center gap-4">
        <Link
          href="/hr/import"
          className="text-sm font-semibold text-white/70 hover:text-white transition-colors"
        >
          Import
        </Link>
        <Link
          href="/hr/settings"
          className="text-sm font-semibold text-white/70 hover:text-white transition-colors"
        >
          Settings
        </Link>
        <LogoutButton />
      </div>
    </header>
  )
}
