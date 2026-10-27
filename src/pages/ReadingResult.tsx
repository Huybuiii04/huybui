import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { Empty, PageHeader } from '../components/ui'
import { SkillResult } from '../components/skill/SkillResult.tsx'
import { useCopy } from '../i18n'
import { loadSkillGrade, type SkillGrade } from '../lib/skillApi.ts'

export default function ReadingResult() {
  const { c } = useCopy()
  const { attemptId = '' } = useParams()
  const location = useLocation()
  const state = location.state as { grade?: SkillGrade } | null
  const [grade, setGrade] = useState<SkillGrade | null>(state?.grade ?? null)
  const [loading, setLoading] = useState(!state?.grade)

  useEffect(() => {
    if (grade) return
    let alive = true
    void loadSkillGrade(attemptId).then(value => {
      if (!alive) return
      setGrade(value)
      setLoading(false)
    })
    return () => { alive = false }
  }, [attemptId, grade])

  return <div className="page">
    <PageHeader
      eyebrow={c('LUYỆN ĐỌC', 'READING')}
      title={c('Kết quả bài Reading', 'Reading result')}
      action={<Link className="button outline" to="/app/reading">{c('Về kho đề', 'Back to the library')}</Link>}
    />
    {loading && <div className="loading-state" role="status">{c('Đang tải kết quả…', 'Loading the result…')}</div>}
    {!loading && (grade ? <SkillResult grade={grade} /> : <Empty title={c('Không tìm thấy kết quả', 'Result not found')} description={c('Lần làm bài này không tồn tại hoặc đã bị xoá.', 'This attempt does not exist or has been deleted.')} />)}
  </div>
}
