import { useMemo } from 'react'
import { sanitizeHtml, type SkillSection } from '../../lib/skillLogic.ts'

/** Cột đọc đoạn văn của phòng làm bài: tiêu đề passage + nội dung đã lọc an toàn. */
export function PassagePanel({ section }: { section: SkillSection }) {
  const html = useMemo(() => sanitizeHtml(section.contentHtml), [section.contentHtml])
  return <div className="skill-passage">
    <header className="skill-passage-head">
      <p className="eyebrow">{section.title}</p>
      {section.topic && <p className="muted">{section.topic}</p>}
    </header>
    <div className="skill-passage-body" dangerouslySetInnerHTML={{ __html: html }} />
  </div>
}
