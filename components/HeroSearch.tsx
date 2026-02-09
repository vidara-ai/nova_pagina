
import React, { useState } from 'react';

const HeroSearch: React.FC = () => {
  const [tab, setTab] = useState<'alugar' | 'comprar'>('comprar');

  return (
    <div className="w-full max-w-5xl mx-auto px-4 -mt-12 md:-mt-16 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
      <div className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-2 md:p-3">
        {/* Tabs */}
        <div className="flex gap-1 mb-2">
          <button 
            onClick={() => setTab('alugar')}
            className={`px-6 py-3 rounded-t-[1.5rem] rounded-b-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
              tab === 'alugar' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            Quero Alugar
          </button>
          <button 
            onClick={() => setTab('comprar')}
            className={`px-6 py-3 rounded-t-[1.5rem] rounded-b-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
              tab === 'comprar' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            Quero Comprar
          </button>
        </div>

        {/* Filters Grid */}
        <div className="flex flex-col md:flex-row items-stretch gap-2">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="bg-slate-50 rounded-2xl p-4 flex flex-col justify-center border border-transparent hover:border-slate-200 transition-all cursor-pointer">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tipo do Imóvel</span>
              <select className="bg-transparent text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer">
                <option>Todos os tipos</option>
                <option>Casas</option>
                <option>Apartamentos</option>
                <option>Terrenos</option>
                <option>Comercial</option>
              </select>
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-4 flex flex-col justify-center border border-transparent hover:border-slate-200 transition-all cursor-pointer">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Localização</span>
              <select className="bg-transparent text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer">
                <option>Todas as cidades</option>
                <option>São Paulo, SP</option>
                <option>Rio de Janeiro, RJ</option>
                <option>Curitiba, PR</option>
                <option>Belo Horizonte, MG</option>
              </select>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 flex flex-col justify-center border border-transparent hover:border-slate-200 transition-all cursor-pointer">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Quartos</span>
              <select className="bg-transparent text-sm font-bold text-slate-900 outline-none appearance-none cursor-pointer">
                <option>Qualquer</option>
                <option>1+ Quartos</option>
                <option>2+ Quartos</option>
                <option>3+ Quartos</option>
                <option>4+ Quartos</option>
              </select>
            </div>
          </div>

          <button className="md:w-48 bg-[#25D366] text-white font-black uppercase tracking-[0.2em] text-xs py-5 md:py-0 rounded-2xl shadow-xl shadow-green-100 hover:bg-[#20ba5a] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Buscar
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSearch;
