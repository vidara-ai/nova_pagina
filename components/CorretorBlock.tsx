
import React from "react";

type CorretorProps = {
  nome?: string;
  descricao?: string;
  creci?: string;
  telefone?: string;
  instagram?: string;
  linkedin?: string;
  tiktok?: string;
};

const CorretorBlock: React.FC<CorretorProps> = ({
  nome = "Marlon Sales",
  descricao = "Especialista em conectar pessoas a oportunidades únicas no mercado de luxo.",
  creci = "4567891011",
  telefone = "8332210008",
  instagram,
  linkedin,
  tiktok,
}) => {
  return (
    <section className="relative py-32 px-6 overflow-hidden bg-slate-50">
      {/* Glow de fundo sutil */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-[4rem] p-12 md:p-20 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] flex flex-col md:flex-row items-center gap-16">
          
          <div className="flex-1 space-y-8 text-center md:text-left">
            <div>
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-indigo-500 mb-4 block">Personal Broker</span>
              <h2 className="text-4xl md:text-7xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                {nome}
              </h2>
            </div>
            
            <p className="text-slate-500 text-sm md:text-lg leading-relaxed font-medium max-w-2xl">
              {descricao}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-10 pt-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">CRECI REGISTRO</span>
                <span className="text-sm font-bold text-slate-900">{creci}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">CONTATO DIRETO</span>
                <span className="text-sm font-bold text-slate-900">{telefone}</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col gap-6 min-w-[300px]">
            <button className="w-full py-6 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-3xl hover:bg-indigo-600 hover:-translate-y-1 transition-all duration-500 shadow-2xl shadow-slate-200">
              Falar com o Corretor
            </button>
            
            <div className="flex justify-center gap-8 py-4 bg-white/50 rounded-3xl border border-white/80">
              {instagram && (
                <a href={instagram} target="_blank" className="text-slate-400 hover:text-indigo-600 transition-colors duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
              )}
              {linkedin && (
                <a href={linkedin} target="_blank" className="text-slate-400 hover:text-indigo-600 transition-colors duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                </a>
              )}
              {tiktok && (
                <a href={tiktok} target="_blank" className="text-slate-400 hover:text-indigo-600 transition-colors duration-300">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.33-.85.51-1.44 1.43-1.58 2.41-.14 1.24.43 2.51 1.46 3.22.88.66 2.05.8 3.11.53 1.15-.23 2.15-1.09 2.52-2.19.1-.31.14-.64.16-.96.03-3.38.01-6.76.02-10.14z"/></svg>
                </a>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CorretorBlock;
