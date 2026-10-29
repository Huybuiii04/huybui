import { useCopy } from '../../i18n'
import { formatBand, SPEAKING_CRITERIA, SPEAKING_CRITERION_LABELS } from '../../lib/speakingLogic.ts'
import type { SpeakingResultView } from '../../lib/speaking.ts'

export function SpeakingResult({ result }: { result: SpeakingResultView }) {
  const { c } = useCopy()
  const turns = result.feedback.turns ?? []
  const audioTurns = result.audioAnalysis.turns ?? []

  return (
    <div className="flex flex-col gap-6">
      <div className="panel">
        <div className="flex items-center gap-6">
          <div>
            <p className="eyebrow">{c('Band ước tính', 'Estimated band')}</p>
            <p className="text-5xl font-black leading-tight">
              {formatBand(result.overallDisplay)}
            </p>
          </div>
          <div className="grid flex-1 gap-2 sm:grid-cols-2">
            {SPEAKING_CRITERIA.map((criterion) => (
              <div key={criterion} className="rounded-lg border p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  {c(...SPEAKING_CRITERION_LABELS[criterion])}
                </p>
                <p className="text-2xl font-black">
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
          <p className="text-[14px] leading-relaxed">{result.feedback.overall.summary}</p>
          {result.feedback.overall.priority_actions.length > 0 && (
            <ul className="mt-3 flex flex-col gap-1.5 text-[14px] leading-relaxed">
              {result.feedback.overall.priority_actions.map((action) => (
                <li key={action}>· {action}</li>
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
            <p className="text-[14px] leading-relaxed">{turn.summary}</p>
          )}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {turn.criteria.map((criterion) => (
              <div key={criterion.criterion} className="rounded-lg border p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  {criterion.criterion}
                </p>
                <p className="text-xl font-black">{formatBand(criterion.score)}</p>
                <p className="mt-1 text-[13px] leading-relaxed">{criterion.rationale}</p>
                {criterion.evidence.length > 0 && (
                  <ul className="mt-2 flex flex-col gap-1 text-[12px] text-muted-foreground">
                    {criterion.evidence.map((quote) => (
                      <li key={quote}>“{quote}”</li>
                    ))}
                  </ul>
                )}
                {criterion.improvements.length > 0 && (
                  <ul className="mt-2 flex flex-col gap-1 text-[13px]">
                    {criterion.improvements.map((item) => (
                      <li key={item}>· {item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
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
                <p className="text-[12px] font-bold uppercase tracking-wide text-muted-foreground">
                  {c('Lần trả lời', 'Turn')} {index + 1} · {turn.part.toUpperCase()}
                </p>
                {turn.mispronounced && turn.mispronounced.length > 0 && (
                  <p className="mt-1 text-[13px]">
                    <strong>{c('Từ phát âm chưa chuẩn', 'Pronunciation issues')}: </strong>
                    {turn.mispronounced.map((item) => `${item.word} (${item.issue})`).join(' · ')}
                  </p>
                )}
                {turn.fillerWords && turn.fillerWords.length > 0 && (
                  <p className="mt-1 text-[13px]">
                    <strong>{c('Từ đệm', 'Fillers')}: </strong>
                    {turn.fillerWords.join(', ')}
                  </p>
                )}
                {turn.intonationNotes && turn.intonationNotes.length > 0 && (
                  <p className="mt-1 text-[13px]">
                    <strong>{c('Ngữ điệu', 'Intonation')}: </strong>
                    {turn.intonationNotes.join(' · ')}
                  </p>
                )}
                {typeof turn.estimatedWpm === 'number' && (
                  <p className="mt-1 text-[13px]">
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
          <p className="whitespace-pre-wrap text-[14px] leading-relaxed">{result.transcript}</p>
        </section>
      )}
    </div>
  )
}
