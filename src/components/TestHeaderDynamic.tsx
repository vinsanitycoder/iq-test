'use client'

import { useEffect, useState } from 'react'
import { TestHeader } from './TestHeader'

const CACHE_KEY = 'iq_company'

interface CompanySettings {
  company_name: string
  company_logo_url: string | null
}

const DEFAULTS: CompanySettings = { company_name: 'Fynlo', company_logo_url: null }

export function TestHeaderDynamic() {
  const [settings, setSettings] = useState<CompanySettings>(DEFAULTS)

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY)
      if (cached) {
        setSettings(JSON.parse(cached))
        return
      }
    } catch {
      // ignore parse errors
    }

    fetch('/api/settings')
      .then((r) => r.json())
      .then((d: CompanySettings) => {
        setSettings(d)
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(d))
        } catch {
          // ignore storage errors
        }
      })
      .catch(() => {})
  }, [])

  return <TestHeader companyName={settings.company_name} logoUrl={settings.company_logo_url} />
}
