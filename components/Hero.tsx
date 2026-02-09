
import React from 'react';
import HeroSearch from './HeroSearch';

const Hero: React.FC = () => {
  return (
    <section className="pt-28 pb-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Main Hero Container */}
        <div className="relative bg-slate-50 rounded-[4rem] overflow-hidden min-h-[500px] md:min-h-[650px] flex flex-col shadow-inner">
          
          {/* Content Upper Part */}
          <div className="relative z-10 pt-16 md:pt-24 px-8 md:px-16 text-center">
            <h1 className="text-4xl md:text-7xl font-black leading-[1] mb-6 animate-in fade-in slide-in-from-top-8 duration-1000">
              <span className="text-indigo-600 block mb-2 uppercase tracking-tighter">ENCONTRE O LUGAR IDEAL</span>
              <span className="text-slate-900 block uppercase tracking-tighter">PARA SEU PRÓXIMO CAPÍTULO</span>
            </h1>
            <p className="max-w-2xl mx-auto text-slate-400 text-xs md:text-sm font-bold uppercase tracking-[0.3em] leading-relaxed animate-in fade-in slide-in-from-top-4 duration-1000 delay-300">
              EXPLORAMOS OS MELHORES BAIRROS E AS PROPRIEDADES MAIS EXCLUSIVAS PARA VOCÊ.
              PRATICIDADE, SEGURANÇA E LUXO EM UM SÓ LUGAR.
            </p>
          </div>

          {/* Panorama Image Background (Bottom Positioned) */}
          <div className="mt-auto h-64 md:h-96 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent z-10" />
            <img 
              src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=2000" 
              alt="City Skyline" 
              className="w-full h-full object-cover object-bottom opacity-80"
            />
          </div>
        </div>

        {/* Search Bar Component */}
        <HeroSearch />
      </div>
    </section>
  );
};

export default Hero;
