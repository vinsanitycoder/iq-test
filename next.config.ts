import type { NextConfig } from 'next'

// ── Build-time environment variable sanity check ─────────────────────────────
// Production outages have been caused by Vercel env vars getting set to the
// wrong values (e.g. a Vercel deployment URL pasted into NEXT_PUBLIC_SUPABASE_URL,
// or staging keys pasted into the Production scope). This check fails the build
// loudly if any required var is missing or obviously malformed — so a bad env
// var can never silently ship to production.
function assertEnv() {
  // Only run during actual builds, not during `next lint` or local `next dev`
  // where some vars may legitimately be absent.
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL === '1'
  if (!isBuild) return

  const errors: string[] = []

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is not set')
  } else if (!/^https:\/\/[a-z0-9]+\.supabase\.co\/?$/.test(url)) {
    errors.push(
      `NEXT_PUBLIC_SUPABASE_URL is malformed: "${url}". ` +
      `Expected: https://<project-ref>.supabase.co (no path, no trailing slash). ` +
      `If you see a vercel.app URL here, the wrong value was pasted into Vercel.`
    )
  }

  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!anon) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
  } else if (anon.split('.').length !== 3) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY does not look like a JWT (expected 3 dot-separated segments)')
  }

  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!service) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY is not set')
  } else if (service.split('.').length !== 3) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY does not look like a JWT (expected 3 dot-separated segments)')
  }

  // Cross-check: anon key, service role key, and URL must all reference the same Supabase project.
  // A Supabase JWT's payload (segment 2) contains a "ref" field with the project ref.
  if (anon && service && anon.split('.').length === 3 && service.split('.').length === 3) {
    try {
      const decode = (jwt: string) =>
        JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString())
      const anonRef = decode(anon).ref
      const serviceRef = decode(service).ref
      if (anonRef && serviceRef && anonRef !== serviceRef) {
        errors.push(
          `NEXT_PUBLIC_SUPABASE_ANON_KEY (project: ${anonRef}) and ` +
          `SUPABASE_SERVICE_ROLE_KEY (project: ${serviceRef}) reference different Supabase projects. ` +
          `Both keys must be from the same project.`
        )
      }
      if (url && anonRef) {
        const urlRef = url.match(/^https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1]
        if (urlRef && urlRef !== anonRef) {
          errors.push(
            `NEXT_PUBLIC_SUPABASE_URL points to project "${urlRef}" but the API keys are for project "${anonRef}". ` +
            `URL and keys must be from the same Supabase project.`
          )
        }
      }
    } catch {
      // Couldn't decode — per-key checks above will carry any errors.
    }
  }

  if (errors.length > 0) {
    console.error('\n\n❌ Environment variable check failed:\n')
    errors.forEach(e => console.error('   • ' + e))
    console.error('\n   Fix in Vercel: Settings → Environment Variables (scope: Production)\n\n')
    throw new Error('Aborting build: invalid environment configuration')
  }

  console.log('✓ Environment variable sanity check passed')
}

assertEnv()

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
}

export default nextConfig
