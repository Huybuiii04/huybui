import { useMemo } from 'react'
import { sanitizeHtml, type SkillSection } from '../../lib/skillLogic.ts'

/** Cột đọc đoạn văn của phòng làm bài: tiêu đề passage + nội dung đã lọc an toàn. */
export function PassagePanel({ section }: { section: SkillSection }) {
  const html = useMemo(() => sanitizeHtml(section.contentHtml), [section.contentHtml])
  return <article className="skill-passage">
    <div className="skill-passage-body" dangerouslySetInnerHTML={{ __html: html }} />
  </article>
}
