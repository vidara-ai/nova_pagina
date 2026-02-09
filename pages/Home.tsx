
import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-['Inter',_sans-serif] selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* 1) LOGO SUPERIOR */}
      <header className="pt-20 pb-12 flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="mb-6">
          <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black text-4xl shadow-2xl shadow-indigo-200 ring-8 ring-indigo-50">
            V
          </div>
        </div>
        <h2 className="text-[12px] font-black uppercase tracking-[0.6em] text-slate-400">
          Vitrine Digital
        </h2>
      </header>

      {/* 2) TÍTULO PRINCIPAL (HERO) */}
      <section className="text-center px-6 mb-16 max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-1000 delay-200">
        <h1 className="text-5xl md:text-8xl font-black text-slate-900 leading-[0.9] mb-10 uppercase tracking-tighter">
          ENCONTRE O LUGAR<br />
          IDEAL PARA SEU<br />
          PRÓXIMO CAPÍTULO
        </h1>
        
        {/* 3) SUBTEXTO */}
        <p className="text-slate-400 text-[11px] md:text-[13px] font-bold max-w-xl mx-auto uppercase tracking-[0.3em] leading-relaxed">
          Exploramos os melhores bairros e as propriedades mais exclusivas para você.<br className="hidden md:block" />
          Praticidade, segurança e luxo em um só lugar.
        </p>
      </section>

      {/* 4) FILTROS EM FORMATO DE PILLS */}
      <section className="flex flex-wrap justify-center gap-3 px-4 mb-24 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
        {['Todos', 'Casas', 'Apartamentos', 'Terrenos', 'Comercial'].map((filter, idx) => (
          <button 
            key={filter} 
            className={`px-10 py-4 rounded-full border text-[11px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95 ${
              idx === 0 
                ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200' 
                : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300 hover:text-slate-600'
            }`}
          >
            {filter}
          </button>
        ))}
      </section>

      {/* 5) ÁREA DE RESULTADOS (ESTADO VAZIO) */}
      <section className="max-w-7xl mx-auto px-6 mb-32 animate-in fade-in duration-1000 delay-500">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-slate-100 to-indigo-50 rounded-[4rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative flex flex-col items-center justify-center py-32 border-4 border-dashed border-slate-100 rounded-[4rem] bg-white">
            <div className="w-20 h-20 text-slate-100 mb-8">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-300">
              Aguardando dados da vitrine digital
            </p>
          </div>
        </div>
      </section>

      {/* 6) BLOCO “DEFINA SEU OBJETIVO” */}
      <section className="max-w-xl mx-auto px-6 mb-40 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700">
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

      {/* 7) FOOTER */}
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

      {/* 8) BOTÃO WHATSAPP */}
      <div className="fixed bottom-12 right-12 z-[100] animate-in fade-in slide-in-from-right-8 duration-1000 delay-1000">
        <a 
          href="https://wa.me/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-20 h-20 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-[0_20px_50px_rgba(37,211,102,0.4)] hover:scale-110 hover:-rotate-6 active:scale-95 transition-all duration-500 group"
        >
          <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.316 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.301-.15-.178-.3-.39-.15-.213-.15-1.258-.62-1.453-.695-.194-.075-.336-.112-.477.112-.142.225-.547.695-.671.825-.124.131-.248.15-.549 0-.301-.15-1.27-.468-2.42-1.494-.894-.797-1.496-1.782-1.672-2.083-.176-.301-.019-.463.131-.613.136-.135.301-.35.452-.525.151-.175.201-.3.301-.5s.05-.375-.025-.525c-.075-.15-.477-1.15-.653-1.575-.172-.416-.346-.359-.477-.365l-.407-.006c-.142 0-.372.053-.566.264-.194.211-.741.725-.741 1.769s.759 2.05 1.059 2.45c.3.4 1.491 2.277 3.611 3.19.504.217.898.347 1.205.445.508.162.971.139 1.336.084.408-.061 1.258-.515 1.434-.1.176-.415.176-.77.124-.825-.052-.055-.194-.085-.495-.235z"/>
          </svg>
        </a>
      </div>

    </div>
  );
};

export default Home;
