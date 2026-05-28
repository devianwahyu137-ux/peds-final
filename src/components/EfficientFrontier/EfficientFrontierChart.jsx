// src/components/EfficientFrontier/EfficientFrontierChart.jsx
// SVG scatter plot of 300 random portfolios + current portfolio position
// Shows the efficient frontier boundary approximation

import { useMemo, useState, useRef } from 'react';
import { useAlphaShieldStore } from '../../stores/alphaShieldStore';
import { SCENARIO_CONFIG } from '../../lib/scenarioPulse';

const CHART_PAD = { top: 20, right: 24, bottom: 40, left: 48 };
const CHART_W   = 660;
const CHART_H   = 280;

export function EfficientFrontierChart({ frontierPoints, currentPortfolio }) {
  const scenarioId          = useAlphaShieldStore((s) => s.scenarioId);
  const config              = SCENARIO_CONFIG[scenarioId];
  const [hovered, setHovered] = useState(null);
  const svgRef              = useRef(null);

  const { riskMin, riskMax, retMin, retMax, plotW, plotH } = useMemo(() => {
    if (!frontierPoints?.length) return {};
    const risks   = frontierPoints.map(p => p.riskPct);
    const returns = frontierPoints.map(p => p.returnPct);
    const rMin    = Math.max(0, Math.min(...risks) - 1);
    const rMax    = Math.max(...risks) + 1;
    const rtMin   = Math.min(...returns) - 1;
    const rtMax   = Math.max(...returns) + 2;
    return {
      riskMin: rMin, riskMax: rMax,
      retMin: rtMin, retMax: rtMax,
      plotW: CHART_W - CHART_PAD.left - CHART_PAD.right,
      plotH: CHART_H - CHART_PAD.top  - CHART_PAD.bottom,
    };
  }, [frontierPoints]);

  if (!frontierPoints?.length || !riskMax) {
    return (
      <div className="flex items-center justify-center h-48 text-[10px] font-mono text-neutral-600 tracking-widest">
        MENUNGGU DATA SIMULASI...
      </div>
    );
  }

  // Map data coordinates to SVG pixel coordinates
  const toX = (risk) =>
    CHART_PAD.left + ((risk - riskMin) / (riskMax - riskMin)) * plotW;
  const toY = (ret) =>
    CHART_PAD.top  + ((retMax - ret)   / (retMax - retMin))   * plotH;

  // Color point by Sharpe ratio
  const sharpeToColor = (sharpe) => {
    if (sharpe >= 1.2) return '#10b981';
    if (sharpe >= 0.8) return '#f59e0b';
    if (sharpe >= 0.4) return '#f97316';
    return '#ef4444';
  };

  // Y-axis grid lines
  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks }, (_, i) =>
    Math.round((retMin + ((retMax - retMin) * i / (yTicks - 1))) * 10) / 10
  );

  // X-axis grid lines
  const xTicks = 5;
  const xTickValues = Array.from({ length: xTicks }, (_, i) =>
    Math.round((riskMin + ((riskMax - riskMin) * i / (xTicks - 1))) * 10) / 10
  );

  const currentX = currentPortfolio ? toX(currentPortfolio.riskPct) : null;
  const currentY = currentPortfolio ? toY(currentPortfolio.returnPct) : null;

  return (
    <div className="space-y-2">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-[8px] font-mono text-neutral-500 px-1">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#10b981' }} />
          Sharpe ≥ 1.2
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#f59e0b' }} />
          Sharpe 0.8–1.2
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: '#ef4444' }} />
          Sharpe &lt; 0.4
        </span>
        {currentPortfolio && (
          <span className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: config?.color ?? '#10b981', boxShadow: `0 0 4px ${config?.color ?? '#10b981'}` }}
            />
            <span style={{ color: config?.color ?? '#10b981' }}>
              Portofolio Kamu
            </span>
          </span>
        )}
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        className="w-full overflow-visible"
        style={{ fontFamily: 'monospace' }}
      >
        {/* Y-axis grid lines + labels */}
        {yTickValues.map((val) => {
          const y = toY(val);
          return (
            <g key={`y-${val}`}>
              <line
                x1={CHART_PAD.left} y1={y}
                x2={CHART_PAD.left + plotW} y2={y}
                stroke="#1a1a1a" strokeWidth={0.5}
              />
              <text
                x={CHART_PAD.left - 6} y={y + 3}
                textAnchor="end" fontSize={8}
                fill="#404040"
              >
                {val}%
              </text>
            </g>
          );
        })}

        {/* X-axis grid lines + labels */}
        {xTickValues.map((val) => {
          const x = toX(val);
          return (
            <g key={`x-${val}`}>
              <line
                x1={x} y1={CHART_PAD.top}
                x2={x} y2={CHART_PAD.top + plotH}
                stroke="#1a1a1a" strokeWidth={0.5}
              />
              <text
                x={x} y={CHART_PAD.top + plotH + 14}
                textAnchor="middle" fontSize={8}
                fill="#404040"
              >
                {val}%
              </text>
            </g>
          );
        })}

        {/* Axis labels */}
        <text
          x={CHART_PAD.left + plotW / 2}
          y={CHART_H - 2}
          textAnchor="middle" fontSize={9}
          fontFamily="monospace" fill="#525252" letterSpacing="2"
        >
          VOLATILITAS (RISIKO) %
        </text>
        <text
          x={12}
          y={CHART_PAD.top + plotH / 2}
          textAnchor="middle" fontSize={9}
          fontFamily="monospace" fill="#525252" letterSpacing="2"
          transform={`rotate(-90, 12, ${CHART_PAD.top + plotH / 2})`}
        >
          RETURN %
        </text>

        {/* Frontier scatter points */}
        {frontierPoints.map((pt, i) => {
          const x = toX(pt.riskPct);
          const y = toY(pt.returnPct);
          const isHov = hovered === i;
          return (
            <circle
              key={i}
              cx={x} cy={y}
              r={isHov ? 5 : 2.5}
              fill={sharpeToColor(pt.sharpe)}
              fillOpacity={isHov ? 1 : 0.55}
              style={{ cursor: 'pointer', transition: 'r 100ms ease' }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}

        {/* Hovered point tooltip */}
        {hovered !== null && frontierPoints[hovered] && (() => {
          const pt = frontierPoints[hovered];
          const x  = toX(pt.riskPct);
          const y  = toY(pt.returnPct);
          const tx = x > CHART_W - 160 ? x - 130 : x + 10;
          const ty = y < 60 ? y + 10 : y - 72;
          return (
            <g>
              <rect
                x={tx} y={ty}
                width={120} height={58}
                rx={6}
                fill="rgba(0,0,0,0.92)"
                stroke="#333" strokeWidth={0.5}
              />
              <text x={tx + 8} y={ty + 14} fontSize={8} fill="#666" letterSpacing="1">
                PORTOFOLIO ACAK
              </text>
              <text x={tx + 8} y={ty + 28} fontSize={9} fill={sharpeToColor(pt.sharpe)} fontWeight="bold">
                Sharpe: {pt.sharpe.toFixed(2)}
              </text>
              <text x={tx + 8} y={ty + 42} fontSize={8} fill="#888">
                R: {pt.returnPct.toFixed(1)}% σ: {pt.riskPct.toFixed(1)}%
              </text>
            </g>
          );
        })()}

        {/* Current portfolio marker */}
        {currentX !== null && currentY !== null && (
          <g>
            {/* Crosshair lines */}
            <line
              x1={currentX} y1={CHART_PAD.top}
              x2={currentX} y2={CHART_PAD.top + plotH}
              stroke={config?.color ?? '#10b981'} strokeWidth={0.5}
              strokeDasharray="3,3" opacity={0.4}
            />
            <line
              x1={CHART_PAD.left} y1={currentY}
              x2={CHART_PAD.left + plotW} y2={currentY}
              stroke={config?.color ?? '#10b981'} strokeWidth={0.5}
              strokeDasharray="3,3" opacity={0.4}
            />
            {/* Pulsing outer ring */}
            <circle
              cx={currentX} cy={currentY} r={10}
              fill="none"
              stroke={config?.color ?? '#10b981'}
              strokeWidth={1} opacity={0.3}
            >
              <animate attributeName="r" values="8;14;8" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
            {/* Core dot */}
            <circle
              cx={currentX} cy={currentY} r={5}
              fill={config?.color ?? '#10b981'}
              stroke="#000" strokeWidth={1.5}
              style={{ filter: `drop-shadow(0 0 6px ${config?.color ?? '#10b981'})` }}
            />
            {/* Label */}
            <text
              x={currentX + 10} y={currentY - 12}
              fontSize={8} fill={config?.color ?? '#10b981'}
              fontWeight="bold" letterSpacing="1"
            >
              PORTOFOLIOKU
            </text>
            <text
              x={currentX + 10} y={currentY - 2}
              fontSize={7} fill="#888"
            >
              Sharpe: {currentPortfolio.sharpe?.toFixed(2)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
