import { useCopy } from '../../i18n'
import { formatClock } from '../../lib/skillLogic.ts'

/** Đồng hồ đếm ngược của phòng làm bài, kèm thanh tiến trình. */
export function TestTimer({ seconds, durationMinutes }: { seconds: number; durationMinutes: number }) {
  const { c } = useCopy()
  const low = seconds <= 300
  const percent = durationMinutes > 0 ? Math.max(0, Math.min(100, (seconds / (durationMinutes * 60)) * 100)) : 0
  return <div className={`skill-timer ${low ? 'is-low' : ''}`}>
    <span className="skill-timer-label">{c('Thời gian còn lại', 'Time left')}</span>
    <span className="skill-timer-value">{formatClock(seconds)}</span>
    <span className="skill-timer-bar"><span style={{ width: `${percent}%` }} /></span>
  </div>
}
