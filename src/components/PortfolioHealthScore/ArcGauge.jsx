// src/components/PortfolioHealthScore/ArcGauge.jsx
// SVG arc gauge — animated 0→score with ease-out cubic
// Zero external libraries

import { useEffect, useState, useRef } from 'react';

const RADIUS      = 80;
const CX          = 110;
const CY          = 110;
const STROKE      = 12;
const START_ANGLE  = -210;  // degrees
const END_ANGLE    = 30;    // degrees (240° total sweep)

/**
 * Convert polar (angle in degrees, radius) to cartesian (x, y).
 */
function polarToXY(angle, r) {
  const rad = (angle * Math.PI) / 180;
  return {
    x: CX + r * Math.cos(rad),
    y: CY + r * Math.sin(rad),
  };
}

/**
 * Build an SVG arc path from startAngle to endAngle.
 */
function describeArc(startAngle, endAngle, r) {
  const s     = polarToXY(startAngle, r);
  const e     = polarToXY(endAngle, r);
  const large = (endAngle - startAngle) > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

/**
 * ArcGauge — renders a 240° arc gauge with animated fill.
 *
 * @param {{ score: number, color: string, animated?: boolean }} props
 */
export function ArcGauge({ score = 0, color = '#10b981', animated = true }) {
  const [displayed, setDisplayed] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    if (!animated) {
      setDisplayed(score);
      fromRef.current = score;
      return;
    }

    let frame;
    const duration = 1200;
    const start    = performance.now();
    const from     = fromRef.current;
    const to       = score;

    function tick(now) {
      const t     = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const val   = Math.round(from + (to - from) * eased);
      setDisplayed(val);
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score, animated]);

  const pct          = displayed / 100;
  const sweepDeg     = 240;
  const progressDeg  = START_ANGLE + sweepDeg * pct;

  const trackPath    = describeArc(START_ANGLE, END_ANGLE, RADIUS);
  const progressPath = pct > 0
    ? describeArc(START_ANGLE, progressDeg, RADIUS)
    : '';

  const gradId = `gauge-grad-${color.replace('#', '')}`;

  return (
    <svg
      width="220"
      height="180"
      viewBox="0 0 220 180"
      className="overflow-visible"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="1.0" />
        </linearGradient>
        <filter id="gauge-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background track */}
      <path
        d={trackPath}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={STROKE}
        strokeLinecap="round"
      />

      {/* Active progress arc */}
      {progressPath && (
        <path
          d={progressPath}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={STROKE}
          strokeLinecap="round"
          filter="url(#gauge-glow)"
        />
      )}

      {/* Score number */}
      <text
        x={CX}
        y={CY - 8}
        textAnchor="middle"
        fontSize="36"
        fontFamily="monospace"
        fontWeight="900"
        fill={color}
      >
        {displayed}
      </text>

      {/* /100 denominator */}
      <text
        x={CX}
        y={CY + 12}
        textAnchor="middle"
        fontSize="9"
        fontFamily="monospace"
        fontWeight="400"
        fill="rgba(255,255,255,0.3)"
        letterSpacing="3"
      >
        /100
      </text>
    </svg>
  );
}
