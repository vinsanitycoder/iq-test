import { randomBytes, createHash } from 'crypto'

// 64-char hex token. Returned to the email link once, then discarded.
export function generateInviteToken(): string {
  return randomBytes(32).toString('hex')
}

// SHA-256 hash — this is what gets stored in invites.token_hash.
export function hashInviteToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex')
}
