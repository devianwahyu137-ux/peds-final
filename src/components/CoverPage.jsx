import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import logo from '@/assets/logo_macroscope.webp';
import bgTexture from '@/assets/bg_texture.png';


export default function CoverPage({ onEnter }) {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Show button after animations settle (e.g. 1.2s delay)
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Listen to keyboard Enter to skip cover
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        onEnter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onEnter]);

  return (
    <div
      onClick={onEnter}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-between p-8 select-none cursor-pointer"
      style={{ backgroundColor: '#0A0A0A' }}
    >
      <style>{`
        @keyframes morphGlow {
          0% {
            background-color: rgba(16, 185, 129, 0.035);
            filter: blur(90px);
            transform: translate(-50%, -50%) scale(1);
          }
          33% {
            background-color: rgba(245, 158, 11, 0.035);
            filter: blur(110px);
            transform: translate(-50%, -50%) scale(1.15);
          }
          66% {
            background-color: rgba(239, 68, 68, 0.03);
            filter: blur(90px);
            transform: translate(-50%, -50%) scale(0.9);
          }
          100% {
            background-color: rgba(16, 185, 129, 0.035);
            filter: blur(90px);
            transform: translate(-50%, -50%) scale(1);
          }
        }

        .morphing-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 450px;
          height: 450px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 1;
          animation: morphGlow 14s infinite ease-in-out;
        }

        .animate-logo {
          animation: logoReveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-fade-in-up {
          opacity: 0;
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes logoReveal {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes buttonPulse {
          0% {
            box-shadow: 0 0 12px 1px rgba(20, 184, 166, 0.15);
            border-color: rgba(20, 184, 166, 0.25);
          }
          50% {
            box-shadow: 0 0 20px 4px rgba(20, 184, 166, 0.35);
            border-color: rgba(20, 184, 166, 0.6);
          }
          100% {
            box-shadow: 0 0 12px 1px rgba(20, 184, 166, 0.15);
            border-color: rgba(20, 184, 166, 0.25);
          }
        }

        .button-pulse {
          animation: buttonPulse 3.5s infinite ease-in-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-logo, .animate-fade-in-up, .morphing-glow, .button-pulse {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
            box-shadow: none !important;
          }
          .morphing-glow {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 450px;
            height: 450px;
            transform: translate(-50%, -50%) !important;
            background-color: rgba(16, 185, 129, 0.04) !important;
            filter: blur(60px) !important;
          }
          .animate-logo {
            transform: scale(1) !important;
          }
        }
      `}</style>

      {/* Concentric circles background texture */}
      <div 
        className="absolute top-1/2 left-1/2 w-[650px] h-[650px] pointer-events-none opacity-[0.025] mix-blend-screen bg-contain bg-no-repeat bg-center"
        style={{ 
          backgroundImage: `url(${bgTexture})`,
          transform: 'translate(-50%, -50%)',
          zIndex: 0
        }}
      />

      {/* Morphing ambient glow in the center */}
      <div className="morphing-glow" />

      {/* Spacer for vertical layout alignment */}
      <div className="flex-1" />

      {/* Center Section: Logo + Wordmark + Tagline */}
      <div className="flex flex-col items-center text-center relative z-10">
        {/* Logo */}
        <div className="w-[120px] h-[120px] flex items-center justify-center animate-logo mb-12">
          <img src={logo} alt="Macroscope Logo" className="w-full h-full object-contain" />
        </div>

        {/* Wordmark "Macroscope" */}
        <h1 
          className="text-3xl md:text-4xl font-extrabold tracking-wider text-white mb-2.5 animate-fade-in-up uppercase font-sans"
          style={{ 
            fontFamily: "'Sora', 'Space Grotesk', 'Geist', 'Inter', sans-serif",
            animationDelay: '250ms' 
          }}
        >
          Macroscope
        </h1>

        {/* Tagline */}
        <p 
          className="text-xs text-neutral-400 max-w-sm leading-relaxed animate-fade-in-up font-sans"
          style={{ animationDelay: '500ms' }}
        >
          Simulator portofolio berbasis skenario makro. Untuk edukasi.
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Mulai Simulasi Button */}
        <div className="h-16 flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation(); // Avoid triggering cover skip click
              onEnter();
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl border border-teal-500/30 bg-teal-950/20 text-teal-400 text-xs font-bold uppercase tracking-widest transition-all duration-300 hover:bg-teal-500/10 hover:border-teal-500/50 hover:text-teal-300 active:scale-[0.98] cursor-pointer relative z-20 button-pulse ${
              showButton ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
            }`}
            style={{ transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease' }}
          >
            <span>Mulai Simulasi</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Bottom Section: Disclaimer */}
      <div className="text-center max-w-md relative z-10">
        <p className="text-[9px] font-sans text-neutral-600 uppercase tracking-widest leading-relaxed">
          Simulasi edukasi independen. Bukan rekomendasi investasi. Bukan produk yang diawasi OJK.
        </p>
      </div>
    </div>
  );
}
