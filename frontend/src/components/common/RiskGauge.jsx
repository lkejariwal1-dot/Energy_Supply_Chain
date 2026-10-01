import { riskTone } from '../../utils/risk.js'

// A radial gauge used as the signature visual for the global risk index.
export default function RiskGauge({ value, size = 180, label = 'Global risk index' }) {
  const tone = riskTone(value)
  const radius = (size - 24) / 2
  const circumference = Math.PI * radius // half circle
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 24} viewBox={`0 0 ${size} ${size / 2 + 24}`}>
        <path
          d={`M 12 ${size / 2 + 12} A ${radius} ${radius} 0 0 1 ${size - 12} ${size / 2 + 12}`}
          fill="none"
          stroke="#2E2E2E"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d={`M 12 ${size / 2 + 12} A ${radius} ${radius} 0 0 1 ${size - 12} ${size / 2 + 12}`}
          fill="none"
          className={tone.text}
          stroke="currentColor"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text
          x={size / 2}
          y={size / 2 - 4}
          textAnchor="middle"
          className={`font-mono font-semibold ${tone.text}`}
          style={{ fontSize: 34, fill: 'currentColor' }}
        >
          {value}
        </text>
        <text
          x={size / 2}
          y={size / 2 + 16}
          textAnchor="middle"
          style={{ fontSize: 11, fill: '#707070' }}
        >
          / 100
        </text>
      </svg>
      <p className={`mt-1 text-xs font-semibold uppercase tracking-wide ${tone.text}`}>{tone.label} risk</p>
      <p className="text-[11px] text-ink-muted">{label}</p>
    </div>
  )
}
