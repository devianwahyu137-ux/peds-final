// src/components/GlossaryTerm/index.jsx
// Wraps any financial term with a hover tooltip explanation.
// Usage: <GlossaryTerm termId="sharpeRatio">Sharpe Ratio</GlossaryTerm>
// Pure CSS positioning — no portal, no external library.

import { useState, useRef } from 'react';
import { GLOSSARY } from '@/lib/glossaryData';
import { Lightbulb } from 'lucide-react';

/**
 * GlossaryTerm — inline term wrapper that shows a contextual
 * tooltip on hover/focus with definition, example, and trivia.
 *
 * @param {{ termId: string, children: React.ReactNode, className?: string }} props
 */
export function GlossaryTerm({ termId, children, className = '' }) {
  const [isOpen, setIsOpen]     = useState(false);
  const [placement, setPlace]   = useState('top');
  const triggerRef = useRef(null);

  const term = GLOSSARY[termId];
  if (!term) return <span>{children}</span>;

  const handleEnter = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    // Place tooltip above if trigger is in lower half of viewport
    setPlace(rect.top > window.innerHeight / 2 ? 'top' : 'bottom');
    setIsOpen(true);
  };

  const handleLeave = () => setIsOpen(false);

  return (
    <span className="relative inline-block">
      {/* Trigger — dashed underline */}
      <span
        ref={triggerRef}
        className={`cursor-help border-b border-dashed transition-colors
                    duration-150 ${className}`}
        style={{
          borderColor: isOpen ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.20)',
          color: isOpen ? 'rgba(99,102,241,1)' : 'inherit',
        }}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocus={handleEnter}
        onBlur={handleLeave}
        tabIndex={0}
        role="button"
        aria-describedby={isOpen ? `glossary-${termId}` : undefined}
      >
        {children}
      </span>

      {/* Tooltip */}
      {isOpen && (
        <div
          id={`glossary-${termId}`}
          role="tooltip"
          className="absolute z-[9999] w-72 pointer-events-none"
          style={{
            [placement === 'top' ? 'bottom' : 'top']: 'calc(100% + 10px)',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <div
            className="rounded-xl p-4 space-y-3 shadow-2xl backdrop-blur-xl
                       border text-left"
            style={{
              background: 'rgba(15,15,20,0.95)',
              borderColor: 'rgba(99,102,241,0.20)',
            }}
          >
            {/* Term header */}
            <div className="flex items-center gap-2">
              <span
                className="text-[9px] font-sans font-black px-1.5 py-0.5
                           rounded-md tracking-wider"
                style={{
                  background: 'rgba(99,102,241,0.15)',
                  color: '#818cf8',
                  border: '1px solid rgba(99,102,241,0.25)',
                }}
              >
                {term.symbol}
              </span>
              <span
                className="text-[11px] font-sans font-bold"
                style={{ color: '#e2e8f0' }}
              >
                {term.term}
              </span>
            </div>

            {/* Definition */}
            <p
              className="text-[10px] font-sans leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.70)' }}
            >
              {term.definition}
            </p>

            {/* Example */}
            <div
              className="rounded-lg p-2.5"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div
                className="text-[8px] font-sans tracking-widest uppercase mb-1"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                CONTOH
              </div>
              <p
                className="text-[9px] font-sans leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.55)' }}
              >
                {term.example}
              </p>
            </div>

            {/* Learn more */}
            <p
              className="text-[8px] font-sans italic flex items-center gap-1"
              style={{ color: 'rgba(255,255,255,0.30)' }}
            >
              <Lightbulb size={9} className="text-yellow-400" /> {term.learnMore}
            </p>
          </div>

          {/* Arrow */}
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              [placement === 'top' ? 'bottom' : 'top']: '-6px',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              [placement === 'top'
                ? 'borderTop'
                : 'borderBottom']: '6px solid rgba(99,102,241,0.20)',
            }}
          />
        </div>
      )}
    </span>
  );
}
