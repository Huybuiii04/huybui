import { useCopy } from '../../i18n'
import type { SpeakingTurnPlan } from '../../lib/speaking.ts'

export function SpeakingTurnPrompt({ turn }: { turn: SpeakingTurnPlan }) {
  const { c } = useCopy()
  return (
    <div className="panel">
      <p className="eyebrow">
        {turn.part.toUpperCase()} · {c('lần trả lời', 'turn')} {turn.orderIndex + 1}
      </p>
      {turn.cueCard ? (
        <>
          <h2>{turn.cueCard.topic}</h2>
          <ul className="mt-3 flex flex-col gap-1.5 text-[14px] leading-relaxed">
            {turn.cueCard.bullets.map((bullet) => (
              <li key={bullet}>· {bullet}</li>
            ))}
          </ul>
          <p className="muted mt-3 text-[12px]">
            {turn.cueCard.time_limit_seconds}s · {c('nói liên tục', 'keep talking')}
          </p>
        </>
      ) : (
        <>
          <h2>{turn.promptText}</h2>
          {turn.questions.length > 1 && (
            <ul className="mt-3 flex flex-col gap-1.5 text-[14px] leading-relaxed">
              {turn.questions.map((question) => (
                <li key={question}>· {question}</li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
