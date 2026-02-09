
import React from 'react';

interface CorretorBlockProps {
  nome: string;
  descricao: string;
  creci: string;
  telefone: string;
  instagram?: string | null;
  tiktok?: string | null;
  linkedin?: string | null;
}

const CorretorBlock: React.FC<CorretorBlockProps> = ({
  nome,
  descricao,
  creci,
  telefone,
  instagram,
  tiktok,
  linkedin
}) => {
  return (
    <section className="bg-white py-24 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start gap-12 md:gap-20">
        
        {/* Lado Esquerdo: Info Principal */}
        <div className="flex-1 space-y-8">
          <div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-6">
              {nome}
            </h2>
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600">
                Corretor de Imóveis
              </span>
              <div className="h-1 w-20 bg-indigo-600 rounded-full"></div>
            </div>
          </div>

          <p className="text-slate-500 text-sm md:text-base leading-relaxed font-medium">
            {descricao}
          </p>

          <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-8">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">CRECI</span>
              <span className="text-sm font-bold text-slate-700">{creci}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contato Direto</span>
              <span className="text-sm font-bold text-slate-700">{telefone}</span>
            </div>
          </div>
        </div>

        {/* Lado Direito: Social e Ação */}
        <div className="w-full md:w-auto flex flex-col gap-8 min-w-[280px]">
          <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 text-center">Conecte-se</h3>
            
            <div className="flex justify-center items-center gap-6">
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-600 transition-colors" title="Instagram">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
              {tiktok && (
                <a href={tiktok} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-600 transition-colors" title="TikTok">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.33-.85.51-1.44 1.43-1.58 2.41-.14 1.24.43 2.51 1.46 3.22.88.66 2.05.8 3.11.53 1.15-.23 2.15-1.09 2.52-2.19.1-.31.14-.64.16-.96.03-3.38.01-6.76.02-10.14z"/>
                  </svg>
                </a>
              )}
              {linkedin && (
                <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-indigo-600 transition-colors" title="LinkedIn">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
          
          <button className="w-full py-5 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-600 hover:-translate-y-1 transition-all duration-300 shadow-xl shadow-slate-100">
            Falar com Marlon Sales
          </button>
        </div>

      </div>
    </section>
  );
};

export default CorretorBlock;
