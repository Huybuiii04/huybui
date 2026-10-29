import { useEffect, useState } from 'react'
import { useParams } from 'react-router'

import { Notice, PageHeader } from '../components/ui'
import { SpeakingResult } from '../components/speaking/SpeakingResult.tsx'
import { useCopy } from '../i18n'
import { pollSpeakingResult, type SpeakingResultView } from '../lib/speaking.ts'

export default function SpeakingResultPage() {
  const { attemptId = '' } = useParams<{ attemptId: string }>()
  const { c } = useCopy()
  const [result, setResult] = useState<SpeakingResultView | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    void pollSpeakingResult(attemptId).then((outcome) => {
      if (outcome.ok) setResult(outcome.value)
      else setError(outcome.code)
    })
  }, [attemptId])

  return (
    <div className="page">
      <PageHeader
        eyebrow="SPEAKING"
        title={c('Kết quả', 'Your result')}
        description={c(
          'Band ước tính theo bốn tiêu chí Speaking chính thức.',
          'Estimated band across the four official Speaking criteria.',
        )}
      />
      {error && (
        <Notice error>
          <div>
            <strong>{c('Không tải được kết quả', 'Could not load the result')}</strong>
            <p>{error}</p>
          </div>
        </Notice>
      )}
      {result && <SpeakingResult result={result} />}
    </div>
  )
}
