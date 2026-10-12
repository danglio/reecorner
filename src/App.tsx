import React from 'react';
import { Search, ShieldAlert, Sparkles, Music } from 'lucide-react';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-conan-navy text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background ambient decorative glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-conan-blue/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-conan-red/10 rounded-full blur-3xl pointer-events-none" />

      <main className="glass-card max-w-lg w-full p-8 rounded-2xl border border-white/10 text-center relative z-10 shadow-2xl">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-conan-red/20 text-conan-red mb-6 border border-conan-red/30 glow-red">
          <Search className="w-8 h-8" />
        </div>

        <h1 className="font-outfit text-3xl font-extrabold tracking-tight text-white mb-2">
          Văn Phòng Thám Tử <span className="text-conan-gold">Mori</span>
        </h1>
        <p className="text-slate-400 text-sm mb-6">
          Detective Conan Shop & Order Tracker • Cửa hàng thẻ bài & Tra cứu đơn hàng
        </p>

        {/* Feature badge preview */}
        <div className="grid grid-cols-2 gap-3 mb-6 text-left">
          <div className="glass-panel p-3 rounded-xl border border-conan-gold/20 flex items-center space-x-3">
            <Sparkles className="w-5 h-5 text-conan-gold flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-200">Thẻ Bài Conan</p>
              <p className="text-[11px] text-slate-400">Vật phẩm sưu tầm</p>
            </div>
          </div>
          <div className="glass-panel p-3 rounded-xl border border-conan-red/20 flex items-center space-x-3">
            <ShieldAlert className="w-5 h-5 text-conan-red flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-200">Tra Cứu Đơn</p>
              <p className="text-[11px] text-slate-400">Chuẩn enne.vn</p>
            </div>
          </div>
        </div>

        {/* Audio equalizer preview indicator */}
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-700/50 text-xs text-slate-300">
          <Music className="w-3.5 h-3.5 text-conan-gold" />
          <span>BGM Soundwave:</span>
          <div className="flex items-end space-x-1 h-5 px-1">
            <div className="w-1 bg-conan-gold rounded-full animate-equalizer-1" />
            <div className="w-1 bg-conan-red rounded-full animate-equalizer-2" />
            <div className="w-1 bg-conan-gold rounded-full animate-equalizer-3" />
            <div className="w-1 bg-conan-red rounded-full animate-equalizer-4" />
          </div>
        </div>
      </main>

      <footer className="mt-8 text-xs text-slate-500 relative z-10">
        Task 1: Vite + React 18 + TypeScript + Tailwind CSS Initialized Successfully
      </footer>
    </div>
  );
};

export default App;
