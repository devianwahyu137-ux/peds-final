import { useState } from "react";

/**
 * Tooltip explanations for each macro indicator.
 * Investor-grade context for financial literacy.
 */
const TOOLTIP_CONTENT = {
  biRate:
    "Suku bunga kebijakan Bank Indonesia. Ketika BI Rate naik, biaya pinjaman meningkat dan pertumbuhan ekonomi melambat. BI Rate tinggi cenderung menekan harga saham namun menguatkan Rupiah.",
  cpi:
    "Tingkat inflasi tahunan. Inflasi di atas 4% mulai menggerogoti daya beli riil. Bank Indonesia biasanya menaikkan suku bunga sebagai respons untuk mendinginkan inflasi.",
  usdIdr:
    "Nilai tukar Rupiah terhadap Dollar AS. Angka yang lebih tinggi berarti Rupiah melemah. Pelemahan Rupiah meningkatkan harga impor dan menekan margin perusahaan berorientasi domestik.",
  dxy:
    "Indeks kekuatan Dollar AS terhadap sekeranjang mata uang utama. DXY di atas 104 biasanya memicu capital outflow dari pasar emerging markets termasuk Indonesia.",
  gs10:
    "Yield obligasi pemerintah AS tenor 10 tahun. Ini adalah benchmark biaya modal global. Ketika yield AS naik, investor asing cenderung menarik dana dari Indonesia ke aset AS.",
  ihsg:
    "Indeks Harga Saham Gabungan — barometer kesehatan pasar modal Indonesia. Mencerminkan ekspektasi kolektif investor terhadap prospek korporasi dan ekonomi Indonesia.",
};

/**
 * MacroTooltip — Floating educational tooltip for macro indicator cards.
 *
 * @param {{ indicatorId: string, children: React.ReactNode }} props
 */
export default function MacroTooltip({ indicatorId, children }) {
  const [isVisible, setIsVisible] = useState(false);
  const content = TOOLTIP_CONTENT[indicatorId];

  if (!content) return children || null;

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="text-[9px] text-neutral-600 hover:text-slate-500 dark:text-neutral-400 transition-colors cursor-help ml-1"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        aria-label={`Info tentang ${indicatorId}`}
      >
        {children || "?"}
      </button>

      {isVisible && (
        <div
          className="tooltip-animated absolute z-50 bottom-full left-1/2 mb-2"
          style={{
            transform: "translateX(-50%)",
            background: "var(--as-bg-primary)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid var(--as-border-primary)",
            borderRadius: "12px",
            padding: "12px 16px",
            maxWidth: "240px",
            width: "max-content",
            fontFamily: "monospace",
            fontSize: "11px",
            lineHeight: "1.6",
            color: "var(--as-text-secondary)",
            pointerEvents: "none",
          }}
        >
          {content}
          {/* Arrow */}
          <div
            className="absolute left-1/2 top-full"
            style={{
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: "5px solid var(--as-border-primary)",
            }}
          />
        </div>
      )}
    </div>
  );
}
