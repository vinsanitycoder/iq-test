interface TestHeaderProps {
  companyName: string
  logoUrl?: string | null
}

export function TestHeader({ companyName, logoUrl }: TestHeaderProps) {
  const initial = companyName.charAt(0).toUpperCase()

  return (
    <div className="w-full bg-fynlo-teal px-5 pt-10 pb-8">
      <div className="flex flex-col items-center gap-2">
        <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-1">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={companyName} className="w-10 h-10 object-contain" />
          ) : (
            <span className="text-white text-2xl font-black">{initial}</span>
          )}
        </div>
        <p className="text-white font-extrabold text-lg leading-tight">{companyName}</p>
        <p className="text-white/70 text-sm font-semibold">Applicant Assessment</p>
      </div>
    </div>
  )
}
