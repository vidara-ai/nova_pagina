
import React, { useState, useEffect } from 'react';

const Home: React.FC = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Lógica para controle de visibilidade do body e estado "ready"
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.7s ease';
    
    const timer = setTimeout(() => {
      setIsReady(true);
      document.body.classList.add('ready');
      document.body.style.opacity = '1';
    }, 1200);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      {/* 1) BOOT SCREEN (Overlay inicial) */}
      {!isReady && (
        <div 
          id="boot-screen" 
          className="fixed inset-0 z-[9999] bg-white flex items-center justify-center transition-all duration-700"
          style={{ opacity: isReady ? 0 : 1, visibility: isReady ? 'hidden' : 'visible' }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl animate-pulse flex items-center justify-center text-white font-black text-xl shadow-2xl">
              V
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">Carregando</span>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <div className={`transition-all duration-700 ${isReady ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        
        {/* 2) HEADER / TOPO */}
        <header className="pt-16 pb-8 px-4 flex flex-col items-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-indigo-100">
              V
            </div>
          </div>
          <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Vitrine Digital</h2>
        </header>

        {/* 3) HERO / TÍTULO PRINCIPAL (Sem números) */}
        <section className="text-center px-6 mb-16 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-7xl font-black text-slate-900 leading-[1] mb-8 uppercase tracking-tighter">
            ENCONTRE O LUGAR IDEAL PARA SEU PROXIMO CAPITULO
          </h1>
          <p className="text-slate-500 text-xs md:text-sm font-bold max-w-lg mx-auto uppercase tracking-[0.2em] leading-relaxed">
            Exploramos os melhores bairros e as propriedades mais exclusivas para você. Praticidade, segurança e luxo em um só lugar.
          </p>
        </section>

        {/* 4) FILTROS EM FORMATO DE BADGE */}
        <section className="flex flex-wrap justify-center gap-3 px-4 mb-20">
          {['Todos', 'Casas', 'Apartamentos', 'Terrenos', 'Comercial'].map((filter) => (
            <button 
              key={filter} 
              className="px-8 py-3 rounded-full border border-slate-100 bg-white shadow-sm text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all active:scale-95"
            >
              {filter}
            </button>
          ))}
        </section>

        {/* 5) ÁREA DE IMÓVEIS (Container de grid) */}
        <section className="max-w-7xl mx-auto px-6 mb-24 min-h-[40vh]">
          <div id="properties-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Os imóveis serão injetados dinamicamente via Supabase no futuro */}
            <div className="col-span-full flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-100 rounded-[3rem]">
              <div className="w-12 h-12 text-slate-200 mb-6">
                 <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                 </svg>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Aguardando dados da vitrine digital</p>
            </div>
          </div>
        </section>

        {/* 6) CHECKBOXES DE INTENÇÃO */}
        <section className="max-w-md mx-auto px-6 mb-32">
          <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 shadow-inner">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-8 text-center">Defina seu objetivo</h3>
            <div className="space-y-4">
              {['Comprar Imóvel', 'Alugar Imóvel', 'Vender meu Imóvel'].map((intention) => (
                <label key={intention} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 cursor-pointer hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50/50 transition-all group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" className="peer appearance-none w-6 h-6 rounded-lg border-2 border-slate-100 checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer" />
                    <svg className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <span className="text-xs font-black text-slate-600 uppercase tracking-tighter group-hover:text-indigo-600 transition-colors">{intention}</span>
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* 7) BOTÃO WHATSAPP NATIVO */}
        <div className="fixed bottom-10 right-10 z-[100]">
          <a 
            href="https://wa.me/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-20 h-20 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-2xl shadow-green-200 hover:scale-110 active:scale-90 transition-all duration-300 group"
          >
            <svg className="w-10 h-10 transform group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.316 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.301-.15-.178-.3-.39-.15-.213-.15-1.258-.62-1.453-.695-.194-.075-.336-.112-.477.112-.142.225-.547.695-.671.825-.124.131-.248.15-.549 0-.301-.15-1.27-.468-2.42-1.494-.894-.797-1.496-1.782-1.672-2.083-.176-.301-.019-.463.131-.613.136-.135.301-.35.452-.525.151-.175.201-.3.301-.5s.05-.375-.025-.525c-.075-.15-.477-1.15-.653-1.575-.172-.416-.346-.359-.477-.365l-.407-.006c-.142 0-.372.053-.566.264-.194.211-.741.725-.741 1.769s.759 2.05 1.059 2.45c.3.4 1.491 2.277 3.611 3.19.504.217.898.347 1.205.445.508.162.971.139 1.336.084.408-.061 1.258-.515 1.434-.1.176-.415.176-.77.124-.825-.052-.055-.194-.085-.495-.235z"/>
            </svg>
          </a>
        </div>

        {/* 8) FOOTER GERENCIÁVEL */}
        <footer className="bg-slate-50 pt-24 pb-12 px-6 text-center border-t border-slate-100">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center gap-6 mb-16">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black">
                V
              </div>
              <h4 className="text-sm font-black uppercase tracking-[0.4em] text-slate-900">Vitrine Digital</h4>
              <p className="text-[11px] font-bold text-slate-400 max-w-sm uppercase tracking-[0.2em] leading-relaxed">
                Transformando a experiência de busca por imóveis em algo simples, transparente e digital. Os melhores negócios começam aqui.
              </p>
            </div>

            <div className="flex justify-center gap-8 mb-16">
              {['Facebook', 'Instagram', 'LinkedIn', 'X-Twitter'].map((social) => (
                <a key={social} href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">{social}</a>
              ))}
            </div>

            <div className="pt-8 border-t border-slate-200/50">
              <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-300">
                &copy; 2025 Vitrine Digital - Todos os direitos reservados
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Home;
