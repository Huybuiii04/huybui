import { useCopy } from '../i18n'

export type ChartSpec =
  | { kind: 'bar'; title: string; categories: string[]; series: { name: string; values: number[]; unit: string }[] }
  | { kind: 'line'; title: string; x: string[]; series: { name: string; values: number[]; unit: string }[] }
  | { kind: 'pie'; title: string; slices: { label: string; value: number }[] }
  | { kind: 'table'; title: string; headers: string[]; rows: (string | number)[][] }
  | { kind: 'process'; title: string; steps: string[] }
  | { kind: 'map'; title: string; before: string[]; after: string[] }
  | { kind: 'mixed'; title: string; pie: { title: string; slices: { label: string; value: number }[] }; table: { title: string; headers: string[]; rows: (string | number)[][] } }
  | { kind: 'image'; url: string; alt?: string; title?: string }

const width = 320
const height = 190
const palette = ['#0f766e', '#14b8a6', '#d97706', '#6366f1', '#dc2626']

function axis(max: number, ticks: number[] = [0, 0.25, 0.5, 0.75, 1]) {
  return ticks.map(tick => ({ y: height - 20 - tick * (height - 40), value: Math.round(max * tick) }))
}

export function ChartPreview({ spec }: { spec: ChartSpec }) {
  const { c } = useCopy()
  if (spec.kind === 'image') {
    return <figure className="chart-preview chart-image"><img src={spec.url} alt={spec.alt ?? spec.title ?? ''} loading="lazy" /><figcaption>{c('Hình đề thi', 'Task image')}</figcaption></figure>
  }
  if (spec.kind === 'mixed') {
    return <div className="chart-preview chart-mixed">
      <div className="chart-mixed-pie"><PieChart title={spec.pie.title} slices={spec.pie.slices} /><TableChart title={spec.table.title} headers={spec.table.headers} rows={spec.table.rows} /></div>
    </div>
  }
  if (spec.kind === 'table') {
    return <div className="chart-preview chart-table"><table><thead><tr>{spec.headers.map(header => <th key={header}>{header}</th>)}</tr></thead><tbody>{spec.rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>
  }
  if (spec.kind === 'process') {
    return <div className="chart-preview chart-process">{spec.steps.map((step, index) => <div className="process-step" key={step}><span>{index + 1}</span><em>{step}</em>{index < spec.steps.length - 1 && <Chevron />}</div>)}</div>
  }
  if (spec.kind === 'map') {
    return <div className="chart-preview chart-map"><div><strong>{c('Trước', 'Before')}</strong>{spec.before.map(item => <span key={item}>{item}</span>)}</div><div><strong>{c('Sau', 'After')}</strong>{spec.after.map(item => <span key={item}>{item}</span>)}</div></div>
  }
  if (spec.kind === 'pie') {
    return <div className="chart-preview chart-pie"><PieChart title={spec.title} slices={spec.slices} /></div>
  }
  if (spec.kind === 'bar') {
    const max = Math.max(...spec.series.flatMap(series => series.values)) * 1.1
    const groupWidth = (width - 40) / spec.categories.length
    const barWidth = Math.min(18, (groupWidth - 10) / spec.series.length)
    return <div className="chart-preview"><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={spec.title}>
      {axis(max).map(tick => <g key={tick.y}><line x1="30" x2={width - 6} y1={tick.y} y2={tick.y} stroke="currentColor" opacity="0.14" /><text x="26" y={tick.y + 3} textAnchor="end" fontSize="7" fill="currentColor" opacity="0.6">{tick.value}</text></g>)}
      {spec.categories.map((category, categoryIndex) => <g key={category}>
        {spec.series.map((series, seriesIndex) => {
          const barHeight = (series.values[categoryIndex] / max) * (height - 40)
          const x = 34 + categoryIndex * groupWidth + 5 + seriesIndex * barWidth
          return <rect key={series.name} x={x} y={height - 20 - barHeight} width={barWidth - 2} height={barHeight} fill={palette[seriesIndex % palette.length]} opacity="0.85" rx="1" />
        })}
        <text x={34 + categoryIndex * groupWidth + groupWidth / 2} y={height - 7} textAnchor="middle" fontSize="7" fill="currentColor" opacity="0.7">{category}</text>
      </g>)}
    </svg><ul className="chart-legend">{spec.series.map((series, index) => <li key={series.name}><span style={{ background: palette[index % palette.length] }} />{series.name}{series.unit ? ` (${series.unit})` : ''}</li>)}</ul></div>
  }
  const max = Math.max(...spec.series.flatMap(series => series.values)) * 1.1
  const stepX = (width - 46) / Math.max(1, spec.x.length - 1)
  return <div className="chart-preview"><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={spec.title}>
    {axis(max).map(tick => <g key={tick.y}><line x1="30" x2={width - 6} y1={tick.y} y2={tick.y} stroke="currentColor" opacity="0.14" /><text x="26" y={tick.y + 3} textAnchor="end" fontSize="7" fill="currentColor" opacity="0.6">{tick.value}</text></g>)}
    {spec.series.map((series, seriesIndex) => {
      const points = series.values.map((value, index) => `${34 + index * stepX},${height - 20 - (value / max) * (height - 40)}`).join(' ')
      return <g key={series.name}><polyline points={points} fill="none" stroke={palette[seriesIndex % palette.length]} strokeWidth="2" /><circle r="2" fill={palette[seriesIndex % palette.length]}>{series.values.map((value, index) => <circle key={index} cx={34 + index * stepX} cy={height - 20 - (value / max) * (height - 40)} r="2.2" fill={palette[seriesIndex % palette.length]} />)}</circle></g>
    })}
    {spec.x.map((label, index) => <text key={label} x={34 + index * stepX} y={height - 7} textAnchor="middle" fontSize="7" fill="currentColor" opacity="0.7">{label}</text>)}
  </svg><ul className="chart-legend">{spec.series.map((series, index) => <li key={series.name}><span style={{ background: palette[index % palette.length] }} />{series.name}{series.unit ? ` (${series.unit})` : ''}</li>)}</ul></div>
}

function Chevron() {
  return <svg className="process-arrow" viewBox="0 0 20 20" aria-hidden="true"><path d="M7 4l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

function PieChart({ title, slices }: { title: string; slices: { label: string; value: number }[] }) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0)
  let angle = -90
  const prepared = slices.map((slice, index) => {
    const portion = slice.value / total
    const start = angle
    angle += portion * 360
    return { ...slice, portion, start, color: palette[index % palette.length] }
  })
  const radius = 68
  const centre = 96
  const toPoint = (degrees: number) => {
    const radians = (degrees * Math.PI) / 180
    return { x: centre + radius * Math.cos(radians), y: centre + radius * Math.sin(radians) }
  }
  return <>
    <svg viewBox="0 0 192 192" role="img" aria-label={title}>
      {prepared.map(slice => {
        const start = toPoint(slice.start)
        const end = toPoint(slice.start + slice.portion * 360)
        const large = slice.portion > 0.5 ? 1 : 0
        return <path key={slice.label} d={`M ${centre} ${centre} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${large} 1 ${end.x} ${end.y} Z`} fill={slice.color} opacity="0.85" />
      })}
    </svg>
    <ul className="chart-legend">{prepared.map(slice => <li key={slice.label}><span style={{ background: slice.color }} />{slice.label} — {Math.round(slice.portion * 100)}%</li>)}</ul>
  </>
}

function TableChart({ title, headers, rows }: { title: string; headers: string[]; rows: (string | number)[][] }) {
  return <div className="chart-table"><table><caption className="sr-only">{title}</caption><thead><tr>{headers.map(header => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>
}
