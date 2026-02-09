
import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-['Inter',_sans-serif] selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Imobiliária Premium Header */}
      <Header />

      {/* Hero Section com Barra de Busca */}
      <Hero />

      {/* ÁREA DE RESULTADOS (ESTADO VAZIO) - Mantida para futura integração */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-slate-100 to-indigo-50 rounded-[4rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative flex flex-col items-center justify-center py-32 border-4 border-dashed border-slate-100 rounded-[4rem] bg-white">
            <div className="w-20 h-20 text-slate-100 mb-8">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-300">
              Aguardando listagem de imóveis destacados
            </p>
          </div>
        </div>
      </section>

      {/* BLOCO “DEFINA SEU OBJETIVO” - Mantido para manter fluxo de UX */}
      <section className="max-w-xl mx-auto px-6 mb-40">
        <div className="bg-slate-50/50 p-12 rounded-[3.5rem] border border-slate-100 shadow-sm backdrop-blur-sm">
          <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-400 mb-10 text-center">
            Defina seu objetivo
          </h3>
          <div className="space-y-4">
            {['Comprar Imóvel', 'Alugar Imóvel', 'Vender meu Imóvel'].map((intention) => (
              <label 
                key={intention} 
                className="flex items-center gap-5 p-6 bg-white rounded-3xl border border-slate-100 cursor-pointer hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100/30 transition-all duration-300 group"
              >
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    className="peer appearance-none w-7 h-7 rounded-xl border-2 border-slate-100 checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer" 
                  />
                  <svg 
                    className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[13px] font-black text-slate-600 uppercase tracking-tighter group-hover:text-indigo-600 transition-colors">
                  {intention}
                </span>
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white pt-32 pb-16 px-6 text-center border-t border-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="mb-10">
            <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg">
              V
            </div>
          </div>
          <h4 className="text-[14px] font-black uppercase tracking-[0.6em] text-slate-900 mb-8">
            Vitrine Digital
          </h4>
          <p className="text-[12px] font-bold text-slate-400 max-w-lg uppercase tracking-[0.2em] leading-loose mb-16 px-4">
            Transformando a experiência de busca por imóveis em algo simples, transparente e digital. 
            Os melhores negócios começam aqui.
          </p>

          <div className="flex flex-wrap justify-center gap-10 mb-20 px-4">
            {['Facebook', 'Instagram', 'LinkedIn', 'X-Twitter'].map((social) => (
              <a 
                key={social} 
                href="#" 
                className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300 hover:text-indigo-600 transition-colors"
              >
                {social}
              </a>
            ))}
          </div>

          <div className="pt-12 border-t border-slate-100 w-full max-w-4xl">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-200">
              &copy; 2025 Vitrine Digital - Todos os direitos reservados
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
