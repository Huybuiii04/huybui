import { useCopy } from '../../i18n'
import { formatBand, SPEAKING_CRITERIA, SPEAKING_CRITERION_LABELS } from '../../lib/speakingLogic.ts'
import type { SpeakingResultView } from '../../lib/speaking.ts'

export function SpeakingResult({ result }: { result: SpeakingResultView }) {
  const { c } = useCopy()
  const turns = result.feedback.turns ?? []
  const audioTurns = result.audioAnalysis.turns ?? []

  return (
    <div className="speaking-result flex flex-col gap-6">
      <div className="panel">
        <div className="flex flex-col items-stretch gap-6 sm:flex-row sm:items-center">
          <div className="speaking-overall">
            <p className="eyebrow">{c('Band ước tính', 'Estimated band')}</p>
            <p className="speaking-band-circle">
              {formatBand(result.overallDisplay)}
            </p>
          </div>
          <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
            {SPEAKING_CRITERIA.map((criterion) => (
              <div key={criterion} className="rounded-lg border p-4">
                <p className="text-[13px] font-semibold">
                  {c(...SPEAKING_CRITERION_LABELS[criterion])}
                </p>
                <p className="text-2xl font-bold tabular-nums">
                  {formatBand(Number(result.scores[criterion] ?? 0))}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {result.feedback.overall?.summary && (
        <section className="panel">
          <h2 className="panel-heading">{c('Tổng quan', 'Overview')}</h2>
          <p className="text-base leading-relaxed">{result.feedback.overall.summary}</p>
          {result.feedback.overall.priority_actions.length > 0 && (
            <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-base leading-relaxed">
              {result.feedback.overall.priority_actions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      {turns.map((turn, index) => (
        <section key={turn.turnId} className="panel">
          <h2 className="panel-heading">
            {c('Lần trả lời', 'Turn')} {index + 1}
          </h2>
          {turn.summary && (
            <p className="text-base leading-relaxed">{turn.summary}</p>
          )}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {turn.criteria.map((criterion) => {
              const label = SPEAKING_CRITERION_LABELS[criterion.criterion as keyof typeof SPEAKING_CRITERION_LABELS]
              return (
                <div key={criterion.criterion} className="min-w-0 rounded-lg border p-4">
                  <p className="text-[13px] font-semibold">
                    {label ? c(...label) : criterion.criterion}
                  </p>
                  <p className="text-2xl font-bold tabular-nums">{formatBand(criterion.score)}</p>
                  <p className="mt-2 text-base leading-relaxed">{criterion.rationale}</p>
                  {criterion.evidence.length > 0 && (
                    <ul className="mt-3 flex flex-col gap-2 text-[14px] leading-relaxed">
                      {criterion.evidence.map((quote) => (
                        <li key={quote}>“{quote}”</li>
                      ))}
                    </ul>
                  )}
                  {criterion.improvements.length > 0 && (
                    <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-base leading-relaxed">
                      {criterion.improvements.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      ))}

      {audioTurns.some(
        (turn) =>
          (turn.fillerWords?.length ?? 0) > 0 ||
          (turn.mispronounced?.length ?? 0) > 0 ||
          (turn.intonationNotes?.length ?? 0) > 0,
      ) && (
        <section className="panel">
          <h2 className="panel-heading">{c('Phát âm & ngữ điệu', 'Pronunciation & delivery')}</h2>
          <div className="flex flex-col gap-4">
            {audioTurns.map((turn, index) => (
              <div key={turn.turnId}>
                <p className="text-[13px] font-semibold">
                  {c('Lần trả lời', 'Turn')} {index + 1} · {turn.part.toUpperCase()}
                </p>
                {turn.mispronounced && turn.mispronounced.length > 0 && (
                  <p className="mt-2 text-base">
                    <strong>{c('Từ phát âm chưa chuẩn', 'Pronunciation issues')}: </strong>
                    {turn.mispronounced.map((item) => `${item.word} (${item.issue})`).join(' · ')}
                  </p>
                )}
                {turn.fillerWords && turn.fillerWords.length > 0 && (
                  <p className="mt-2 text-base">
                    <strong>{c('Từ đệm', 'Fillers')}: </strong>
                    {turn.fillerWords.join(', ')}
                  </p>
                )}
                {turn.intonationNotes && turn.intonationNotes.length > 0 && (
                  <p className="mt-2 text-base">
                    <strong>{c('Ngữ điệu', 'Intonation')}: </strong>
                    {turn.intonationNotes.join(' · ')}
                  </p>
                )}
                {typeof turn.estimatedWpm === 'number' && (
                  <p className="mt-2 text-base">
                    <strong>{c('Tốc độ nói', 'Speaking rate')}: </strong>
                    {Math.round(turn.estimatedWpm)} wpm
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {result.transcript && (
        <section className="panel">
          <h2 className="panel-heading">{c('Lời bạn đã nói', 'What you said')}</h2>
          <p className="whitespace-pre-wrap text-base leading-relaxed">{result.transcript}</p>
        </section>
      )}
    </div>
  )
}
