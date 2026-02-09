
import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import CorretorBlock from '../components/CorretorBlock';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-['Inter',_sans-serif] selection:bg-indigo-100 selection:text-indigo-900 transition-all duration-300">
      
      {/* Imobiliária Premium Header */}
      <Header />

      {/* Hero Section com Visual Impactante e Profundidade */}
      <Hero />

      {/* Perfil do Corretor com Estética Institucional Premium */}
      <CorretorBlock 
        nome="Marlon Sales"
        descricao="Transformando a complexa jornada imobiliária em uma experiência de sucesso absoluto. Focado em conectar pessoas a oportunidades exclusivas com expertise estratégica e atendimento humano."
        creci="4567891011"
        telefone="83 3221.0008"
        instagram="https://instagram.com/marlonsales"
        linkedin="https://linkedin.com/in/marlonsales"
        tiktok="https://tiktok.com/@marlonsales"
      />

      {/* ÁREA DE RESULTADOS (ESTADO VAZIO) - Design de Placeholder Sofisticado */}
      <section className="max-w-7xl mx-auto px-6 py-32 animate-in fade-in duration-1000">
        <div className="relative group overflow-hidden rounded-[4rem]">
          <div className="absolute -inset-1 bg-gradient-to-r from-slate-100 via-indigo-50 to-slate-100 rounded-[4rem] blur-[20px] opacity-30 group-hover:opacity-60 transition duration-1000"></div>
          <div className="relative flex flex-col items-center justify-center py-40 border border-slate-100 rounded-[4rem] bg-white/80 backdrop-blur-sm transition-all duration-500 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-50/50">
            <div className="w-24 h-24 text-slate-100 mb-10 transform group-hover:scale-110 transition-transform duration-700">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-300 group-hover:text-indigo-400 transition-colors duration-500">
              Aguardando curadoria de imóveis exclusivos
            </p>
          </div>
        </div>
      </section>

      {/* BLOCO “DEFINA SEU OBJETIVO” - UX Refinada com Hover states */}
      <section className="max-w-xl mx-auto px-6 mb-48">
        <div className="bg-slate-50/80 backdrop-blur-xl p-16 rounded-[4rem] border border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)]">
          <h3 className="text-[12px] font-black uppercase tracking-[0.6em] text-slate-400 mb-12 text-center">
            Como podemos ajudar?
          </h3>
          <div className="space-y-5">
            {['Comprar Imóvel', 'Alugar Imóvel', 'Vender meu Imóvel'].map((intention) => (
              <label 
                key={intention} 
                className="flex items-center gap-6 p-7 bg-white rounded-[2rem] border border-slate-50 cursor-pointer hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-100/20 hover:-translate-y-1 transition-all duration-500 group"
              >
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    className="peer appearance-none w-8 h-8 rounded-2xl border-2 border-slate-100 checked:bg-indigo-600 checked:border-indigo-600 transition-all duration-500 cursor-pointer" 
                  />
                  <svg 
                    className="absolute w-5 h-5 text-white opacity-0 peer-checked:opacity-100 transition-all duration-500 pointer-events-none" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-black text-slate-700 uppercase tracking-tighter group-hover:text-indigo-600 transition-colors duration-500">
                  {intention}
                </span>
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER - Minimalista e Sofisticado */}
      <footer className="bg-white pt-40 pb-20 px-6 text-center border-t border-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="mb-12 group">
            <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white font-black text-2xl shadow-2xl group-hover:bg-indigo-600 group-hover:rotate-12 transition-all duration-500">
              V
            </div>
          </div>
          <h4 className="text-[16px] font-black uppercase tracking-[0.8em] text-slate-900 mb-10">
            Vitrine Digital
          </h4>
          <p className="text-[12px] font-bold text-slate-400 max-w-xl uppercase tracking-[0.3em] leading-loose mb-20 px-4 opacity-70">
            Redefinindo a busca por excelência imobiliária. 
            Simples, transparente e digital. 
            Os melhores negócios começam com a melhor experiência.
          </p>

          <div className="flex flex-wrap justify-center gap-12 mb-24 px-4">
            {['Facebook', 'Instagram', 'LinkedIn', 'X-Twitter'].map((social) => (
              <a 
                key={social} 
                href="#" 
                className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-300 hover:text-slate-900 transition-all duration-300 hover:translate-y-[-2px]"
              >
                {social}
              </a>
            ))}
          </div>

          <div className="pt-16 border-t border-slate-50 w-full max-w-5xl">
            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-200">
              &copy; 2025 Vitrine Digital — Luxury Real Estate Experience
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
