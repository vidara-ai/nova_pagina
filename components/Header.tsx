
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100 group-hover:scale-105 transition-transform">
            V
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tighter uppercase">
            Vitrine<span className="text-indigo-600">Digital</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {['Alugar', 'Comprar', 'Lançamentos', 'Serviços'].map((item) => (
            <a 
              key={item} 
              href="#" 
              className="text-sm font-bold text-slate-500 hover:text-indigo-600 uppercase tracking-widest transition-colors"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button className="hidden sm:block px-5 py-2.5 border-2 border-slate-200 text-slate-600 text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all">
            Anuncie seu imóvel
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#25D366] text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-green-100 hover:bg-[#20ba5a] hover:-translate-y-0.5 transition-all">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.316 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.301-.15-.178-.3-.39-.15-.213-.15-1.258-.62-1.453-.695-.194-.075-.336-.112-.477.112-.142.225-.547.695-.671.825-.124.131-.248.15-.549 0-.301-.15-1.27-.468-2.42-1.494-.894-.797-1.496-1.782-1.672-2.083-.176-.301-.019-.463.131-.613.136-.135.301-.35.452-.525.151-.175.201-.3.301-.5s.05-.375-.025-.525c-.075-.15-.477-1.15-.653-1.575-.172-.416-.346-.359-.477-.365l-.407-.006c-.142 0-.372.053-.566.264-.194.211-.741.725-.741 1.769s.759 2.05 1.059 2.45c.3.4 1.491 2.277 3.611 3.19.504.217.898.347 1.205.445.508.162.971.139 1.336.084.408-.061 1.258-.515 1.434-.1.176-.415.176-.77.124-.825-.052-.055-.194-.085-.495-.235z"/>
            </svg>
            Fale com um corretor
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
