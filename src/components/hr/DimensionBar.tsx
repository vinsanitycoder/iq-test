type Props = {
  leftPole: string   // e.g. 'E'
  rightPole: string  // e.g. 'I'
  score: number      // 0–100 toward rightPole
  label: string      // winning pole letter
}

export default function DimensionBar({ leftPole, rightPole, score, label }: Props) {
  const pct = Math.round(score)
  const isRight = label === rightPole
  const displayPct = isRight ? pct : 100 - pct
  const dominantPole = isRight ? rightPole : leftPole

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs font-semibold text-fynlo-subtle">
        <span>{leftPole}</span>
        <span className="text-fynlo-dark font-bold">
          {dominantPole} · {displayPct}%
        </span>
        <span>{rightPole}</span>
      </div>
      <div className="relative h-2.5 rounded-full bg-gray-100 overflow-hidden">
        {/* Bar grows from the dominant pole's side toward center */}
        {isRight ? (
          <div
            className="absolute inset-y-0 right-0 rounded-full"
            style={{ width: `${pct}%`, backgroundColor: '#0084AD' }}
          />
        ) : (
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${100 - pct}%`, backgroundColor: '#0084AD' }}
          />
        )}
      </div>
    </div>
  )
}
