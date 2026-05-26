import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
  Preview,
} from '@react-email/components'

export interface InviteEmailProps {
  applicantFirstName: string
  inviteUrl: string
  deadlineLabel: string
  companyName?: string
  customMessage?: string
}

const TEAL = '#0084AD'
const TERRA = '#BC3F1D'
const BG = '#F7F7F3'
const BODY = '#4A6572'

export function InviteEmail({
  applicantFirstName,
  inviteUrl,
  deadlineLabel,
  companyName = 'Fynlo',
  customMessage,
}: InviteEmailProps) {
  const defaultParagraphs = [
    `Thanks for your interest in joining the team at ${companyName}. As the next step, we'd love for you to complete a short personality assessment.`,
    `It's 100 questions and takes about 30–45 minutes. There are no right or wrong answers — just be yourself. You can pause and return on a different device if you need to.`,
  ]
  const paragraphs = customMessage
    ? customMessage.split(/\n\n+/).filter(p => p.trim())
    : defaultParagraphs

  return (
    <Html>
      <Head />
      <Preview>You&apos;ve been invited to take a short personality assessment</Preview>
      <Body style={{ backgroundColor: BG, fontFamily: 'Nunito, Arial, sans-serif', color: BODY, margin: 0, padding: '24px 0' }}>
        <Container style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 32, maxWidth: 560, margin: '0 auto', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <Heading as="h1" style={{ color: TEAL, fontSize: 24, margin: '0 0 16px 0' }}>
            Hi {applicantFirstName},
          </Heading>
          {paragraphs.map((para, i) => (
            <Text key={i} style={{ fontSize: 16, lineHeight: '24px', margin: '0 0 16px 0', whiteSpace: 'pre-wrap' }}>
              {para.trim()}
            </Text>
          ))}
          <Section style={{ textAlign: 'center', margin: '28px 0' }}>
            <Button
              href={inviteUrl}
              style={{ backgroundColor: TERRA, color: '#ffffff', padding: '14px 28px', borderRadius: 8, fontSize: 16, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}
            >
              Start the assessment
            </Button>
          </Section>
          <Text style={{ fontSize: 14, lineHeight: '20px', margin: '0 0 8px 0' }}>
            Please complete it by <strong>{deadlineLabel}</strong>.
          </Text>
          <Hr style={{ borderColor: '#e5e7eb', margin: '24px 0' }} />
          <Text style={{ fontSize: 12, color: '#9aa5ad', margin: 0 }}>
            This link is unique to you — please don&apos;t share it. If the button doesn&apos;t work, copy and paste this link into your browser:
          </Text>
          <Text style={{ fontSize: 12, color: '#9aa5ad', wordBreak: 'break-all', margin: '6px 0 0 0' }}>
            {inviteUrl}
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default InviteEmail
