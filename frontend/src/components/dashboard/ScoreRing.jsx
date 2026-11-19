import { scoreTone } from '../../utils/format';

const strokeByTone = { success: '#2cc9a0', warning: '#f59e0b', danger: '#f87171' };

/** Circular 0–100 gauge. Shows a dash when there is no score yet. */
export function ScoreRing({ score, size = 132, stroke = 10, trackColor = 'rgba(255,255,255,0.1)', children }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const hasScore = typeof score === 'number';
  const offset = hasScore ? circumference * (1 - Math.min(Math.max(score, 0), 100) / 100) : circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={hasScore ? strokeByTone[scoreTone(score)] : 'transparent'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}
