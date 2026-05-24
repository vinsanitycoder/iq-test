export const dynamic = 'force-dynamic'

export default function PersonalityInvalidPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F7F7F3] px-4 font-[Nunito]">
      <div className="bg-white rounded-2xl shadow-md max-w-md w-full p-8 text-center">
        <h1 className="text-2xl font-bold text-[#0084AD] mb-3">This link isn&apos;t valid</h1>
        <p className="text-[#4A6572] leading-relaxed">
          We couldn&apos;t find a matching invitation. The link may have been
          revoked or copied incorrectly. Please check with the person who sent
          it to you.
        </p>
      </div>
    </main>
  )
}
