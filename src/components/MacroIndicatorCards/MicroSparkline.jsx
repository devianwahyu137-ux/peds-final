import React from "react";

/**
 * MicroSparkline — Pure SVG sparkline component
 *
 * Lightweight sparkline for macro indicator cards.
 * Uses cubic bezier smoothing and gradient area fill.
 *
 * @param {{ data: number[], color: string, width?: number, height?: number, showArea?: boolean }} props
 */
export default function MicroSparkline({ data, color, width = 120, height = 40, showArea = true }) {
  if (!data || data.length < 2) return null;

  // Normalize data to [padding, height - padding] range
  const padding = 4;
  const mn = Math.min(...data);
  const mx = Math.max(...data);
  const range = mx - mn || 1;

  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * (width - padding * 2) + padding,
    y: height - padding - ((v - mn) / range) * (height - padding * 2),
  }));

  // Build smooth cubic bezier path
  let linePath = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cpx1 = p0.x + (p1.x - p0.x) / 3;
    const cpy1 = p0.y;
    const cpx2 = p0.x + 2 * (p1.x - p0.x) / 3;
    const cpy2 = p1.y;
    linePath += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${p1.x} ${p1.y}`;
  }

  // Area fill path — same curve + close to bottom corners
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  const gradientId = `spark-grad-${color.replace("#", "")}`;
  const lastPoint = points[points.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      {showArea && (
        <path d={areaPath} fill={`url(#${gradientId})`} />
      )}

      {/* Line stroke */}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Current value dot — glowing endpoint */}
      <circle
        cx={lastPoint.x}
        cy={lastPoint.y}
        r="2.5"
        fill={color}
        style={{ filter: `drop-shadow(0 0 3px ${color})` }}
      />
    </svg>
  );
}
