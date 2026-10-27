import { useCallback, useEffect, useState } from 'react'
import { useCopy } from '../../i18n'
import { loadAdminSkillTests, setSkillTestStatus, type AdminSkillTest } from '../../lib/skillAdmin.ts'

export default function SkillsTab({ onError, onBusy }: { onError: (message: string) => void; onBusy: (busy: boolean) => void }) {
  const { c } = useCopy()
  const [tests, setTests] = useState<AdminSkillTest[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(() => {
    void loadAdminSkillTests().then(items => {
      setTests(items)
      setLoading(false)
    })
  }, [])

  useEffect(() => { reload() }, [reload])

  const changeStatus = async (test: AdminSkillTest, status: 'draft' | 'published' | 'hidden') => {
    onBusy(true)
    const ok = await setSkillTestStatus(test.id, status)
    onBusy(false)
    if (!ok) { onError(c('Không đổi được trạng thái đề.', 'The test status could not be changed.')); return }
    reload()
  }

  return <section className="panel">
    <h2>{c('Kho đề Reading', 'Reading test library')}</h2>
    {loading && <div className="loading-state" role="status">{c('Đang tải…', 'Loading…')}</div>}
    {!loading && !tests.length && <p className="muted">{c('Chưa có đề nào.', 'No tests yet.')}</p>}
    <div className="admin-skill-list">
      {tests.map(test => <article key={test.id} className="admin-skill">
        <header>
          <div>
            <p className="eyebrow">{test.series} · {test.skill}</p>
            <h3>{test.title}</h3>
            <p className="muted">{test.slug} · {test.status} · {test.questionCount} {c('câu', 'questions')}</p>
          </div>
          <div className="admin-skill-actions">
            <button type="button" className="button outline" onClick={() => void changeStatus(test, 'published')}>{c('Publish', 'Publish')}</button>
            <button type="button" className="button outline" onClick={() => void changeStatus(test, 'draft')}>{c('Bản nháp', 'Draft')}</button>
            <button type="button" className="button outline" onClick={() => void changeStatus(test, 'hidden')}>{c('Ẩn khỏi kho', 'Hide')}</button>
          </div>
        </header>
        {test.sections.length > 0 && <ul>
          {test.sections.map(section => <li key={section.id}>
            <span>{section.sectionNo}. {section.title}</span>
          </li>)}
        </ul>}
      </article>)}
    </div>
  </section>
}
