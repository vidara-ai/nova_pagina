
import React from 'react';
import HeroSearch from './HeroSearch';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background Image com profundidade */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2000" 
          alt="Luxury Real Estate" 
          className="w-full h-full object-cover scale-105"
        />
        {/* Overlay em gradiente escuro -> transparente */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/40 to-white z-10" />
        {/* Glow radial suave atrás do título */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full z-10" />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-6 pt-20 pb-12 w-full flex flex-col items-center">
        {/* Content Upper Part */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-8 duration-1000">
          <h1 className="text-5xl md:text-8xl font-black leading-[0.9] mb-8 text-white uppercase tracking-tighter">
            <span className="text-indigo-400">ENCONTRE O LUGAR</span><br />
            IDEAL PARA SEU<br />
            PRÓXIMO CAPÍTULO
          </h1>
          <p className="max-w-2xl mx-auto text-slate-200 text-xs md:text-sm font-bold uppercase tracking-[0.4em] leading-relaxed opacity-80">
            Exploramos os melhores bairros e as propriedades mais exclusivas para você.<br className="hidden md:block" />
            Praticidade, segurança e luxo em um só lugar.
          </p>
        </div>

        {/* Search Bar Component */}
        <HeroSearch />
      </div>
    </section>
  );
};

export default Hero;
