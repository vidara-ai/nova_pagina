
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import CorretorBlock from '../components/CorretorBlock';
import { supabase } from '../services/supabase';
import { Imovel } from '../types';

const Home: React.FC = () => {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImoveis();
  }, []);

  async function fetchImoveis() {
    try {
      setLoading(true);
      
      // Query otimizada:
      // 1. Seleciona todos os campos (*) da tabela imoveis para garantir compatibilidade com a interface Imovel
      // 2. Faz join com imoveis_fotos filtrando apenas a capa (!inner garante que só traz se tiver foto)
      // 3. Filtra apenas ativos
      // 4. Ordena por destaque primeiro, depois pela ordem de destaque
      const { data, error } = await supabase
        .from('imoveis')
        .select(`
          *,
          imoveis_fotos!inner(*)
        `)
        .eq('ativo', true)
        .eq('imoveis_fotos.is_capa', true)
        .order('destaque', { ascending: false })
        .order('ordem_destaque', { ascending: true })
        .limit(6);

      if (error) throw error;
      // Fix: Cast explícito para Imovel[] para resolver erro de atribuição de tipo no estado
      setImoveis((data as unknown as Imovel[]) || []);
    } catch (err) {
      console.error('Erro ao carregar imóveis:', err);
    } finally {
      setLoading(false);
    }
  }

  const formatPrice = (value: number | null) => {
    if (!value) return null;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-white font-['Inter',_sans-serif] selection:bg-indigo-100 selection:text-indigo-900 transition-all duration-300">
      <Header />
      <Hero />

      {/* SEÇÃO DE LISTAGEM DE IMÓVEIS */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-4 block">Curadoria Exclusiva</span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-tight">
              PROPRIEDADES EM <span className="text-slate-400">DESTAQUE</span>
            </h2>
          </div>
          <button className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 border-b-2 border-slate-100 hover:border-indigo-600 pb-2 transition-all">
            Ver catálogo completo
          </button>
        </div>

        {loading ? (
          /* SKELETON LOADING */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse space-y-4">
                <div className="bg-slate-100 aspect-[4/3] rounded-[2.5rem]" />
                <div className="h-4 bg-slate-100 w-2/3 rounded" />
                <div className="h-4 bg-slate-100 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : imoveis.length > 0 ? (
          /* GRID DE IMÓVEIS REAL */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {imoveis.map((imovel) => (
              <article 
                key={imovel.id} 
                className="group cursor-pointer bg-white rounded-[2.5rem] overflow-hidden border border-slate-50 hover:border-indigo-100 transition-all duration-500 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]"
              >
                {/* Imagem com Badge de Destaque */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={imovel.imoveis_fotos && imovel.imoveis_fotos[0]?.url} 
                    alt={imovel.titulo}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {imovel.destaque && (
                    <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest text-indigo-600 shadow-sm">
                      Destaque
                    </div>
                  )}
                  <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                    <div className="bg-slate-900/80 backdrop-blur-md px-5 py-3 rounded-2xl text-white">
                      <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-1">
                        {imovel.valor_venda ? 'Venda' : 'Locação'}
                      </p>
                      <p className="text-sm font-black">
                        {formatPrice(imovel.valor_venda || imovel.valor_locacao)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Conteúdo do Card */}
                <div className="p-8 space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {imovel.titulo}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                      <svg className="w-3 h-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      {imovel.bairro}, {imovel.cidade}/{imovel.uf}
                    </p>
                  </div>

                  {/* Características */}
                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900">{imovel.dormitorios}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dorms</span>
                    </div>
                    <div className="w-1 h-1 bg-slate-200 rounded-full" />
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900">{imovel.banheiros}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Banhs</span>
                    </div>
                    <div className="w-1 h-1 bg-slate-200 rounded-full" />
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900">{imovel.vagas_garagem}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vagas</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* ESTADO VAZIO ELEGANTE */
          <div className="relative group overflow-hidden rounded-[4rem]">
            <div className="absolute -inset-1 bg-gradient-to-r from-slate-100 via-indigo-50 to-slate-100 rounded-[4rem] blur-[20px] opacity-30 group-hover:opacity-60 transition duration-1000"></div>
            <div className="relative flex flex-col items-center justify-center py-40 border border-slate-100 rounded-[4rem] bg-white/80 backdrop-blur-sm transition-all duration-500 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-50/50">
              <div className="w-24 h-24 text-slate-100 mb-10 transform group-hover:scale-110 transition-transform duration-700">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-300 group-hover:text-indigo-400 transition-colors duration-500">
                Nenhum imóvel disponível no momento
              </p>
            </div>
          </div>
        )}
      </section>

      <CorretorBlock 
        nome="Marlon Sales"
        descricao="Transformando a complexa jornada imobiliária em uma experiência de sucesso absoluto. Focado em conectar pessoas a oportunidades exclusivas com expertise estratégica e atendimento humano."
        creci="4567891011"
        telefone="83 3221.0008"
        instagram="https://instagram.com/marlonsales"
        linkedin="https://linkedin.com/in/marlonsales"
        tiktok="https://tiktok.com/@marlonsales"
      />

      {/* BLOCO “DEFINA SEU OBJETIVO” */}
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
