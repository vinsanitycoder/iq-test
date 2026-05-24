export const dynamic = 'force-dynamic'

export default function PersonalityExpiredPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F7F7F3] px-4 font-nunito">
      <div className="bg-white rounded-2xl shadow-md max-w-md w-full p-8 text-center">
        <h1 className="text-2xl font-bold text-[#0084AD] mb-3">This link has expired</h1>
        <p className="text-[#4A6572] leading-relaxed">
          The deadline for this invitation has passed. Please reach out to the
          person who sent you the link if you&apos;d still like to take the
          assessment.
        </p>
      </div>
    </main>
  )
}
