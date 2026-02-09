
import React, { useState } from 'react';

const HeroSearch: React.FC = () => {
  const [tab, setTab] = useState<'alugar' | 'comprar'>('comprar');

  return (
    <div className="w-full max-w-5xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
      {/* Container com Glassmorphism */}
      <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] border border-white/40 p-3 md:p-4">
        {/* Tabs */}
        <div className="flex gap-2 mb-3 ml-2">
          <button 
            onClick={() => setTab('alugar')}
            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
              tab === 'alugar' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:text-indigo-600 hover:bg-white/50'
            }`}
          >
            Quero Alugar
          </button>
          <button 
            onClick={() => setTab('comprar')}
            className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
              tab === 'comprar' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:text-indigo-600 hover:bg-white/50'
            }`}
          >
            Quero Comprar
          </button>
        </div>

        {/* Filters Grid */}
        <div className="flex flex-col md:flex-row items-stretch gap-3">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white/50 rounded-3xl p-5 flex flex-col justify-center border border-slate-100 hover:border-indigo-200 hover:bg-white transition-all cursor-pointer group">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-400 transition-colors">Tipo do Imóvel</span>
              <select className="bg-transparent text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer">
                <option>Todos os tipos</option>
                <option>Casas de Luxo</option>
                <option>Apartamentos Garden</option>
                <option>Coberturas</option>
                <option>Comercial Premium</option>
              </select>
            </div>
            
            <div className="bg-white/50 rounded-3xl p-5 flex flex-col justify-center border border-slate-100 hover:border-indigo-200 hover:bg-white transition-all cursor-pointer group">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-400 transition-colors">Localização</span>
              <select className="bg-transparent text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer">
                <option>Todas as regiões</option>
                <option>Jardins, SP</option>
                <option>Leblon, RJ</option>
                <option>Batuel, PR</option>
                <option>Lourdes, MG</option>
              </select>
            </div>

            <div className="bg-white/50 rounded-3xl p-5 flex flex-col justify-center border border-slate-100 hover:border-indigo-200 hover:bg-white transition-all cursor-pointer group">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-400 transition-colors">Dormitórios</span>
              <select className="bg-transparent text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer">
                <option>Indiferente</option>
                <option>2+ Suítes</option>
                <option>3+ Suítes</option>
                <option>4+ Suítes</option>
              </select>
            </div>
          </div>

          <button className="md:w-56 bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-xs py-6 md:py-0 rounded-[2rem] shadow-2xl shadow-slate-200 hover:bg-indigo-600 hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Explorar
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSearch;
