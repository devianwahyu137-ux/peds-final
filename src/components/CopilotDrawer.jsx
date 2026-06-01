import { X, Sparkles } from "lucide-react";

export default function CopilotDrawer({ isOpen, onClose }) {
  return (
    <>
      {/* Optional Backdrop for mobile clicks outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer Container */}
      <div 
        className={`fixed top-0 right-0 h-screen w-[90%] md:w-[400px] z-50 bg-[#0a0a0a] border-l border-white/5 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header & Close Button */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#0a0a0a]">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-400" />
            <h2 className="text-sm font-semibold text-neutral-200 tracking-wide">
              AlphaShield Quant Copilot
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 transition-all cursor-pointer"
            aria-label="Close drawer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Chat History Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          
          {/* Mock User Message */}
          <div className="flex justify-end">
            <div className="bg-neutral-800/50 rounded-l-xl rounded-tr-xl p-3 text-sm text-neutral-300 max-w-[85%] shadow-sm">
              Bagaimana posisi yield SBN saat ini?
            </div>
          </div>

          {/* Mock AI Message */}
          <div className="flex justify-start">
            <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-r-xl rounded-tl-xl p-3 text-sm text-neutral-200 max-w-[90%] shadow-sm leading-relaxed">
              Berdasarkan kondisi TIGHTENING, yield SBN 10Y berada di level atraktif 6.71%. Mengingat inflasi di 3.48%, ini memberikan real yield yang solid. Disarankan melakukan rotasi dari saham berisiko tinggi (teknologi) ke instrumen SBN.
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}
