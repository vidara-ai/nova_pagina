
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Icons } from '../constants';

// Interface baseada no esquema solicitado para o Supabase
interface ImovelRow {
  id: string;
  codigo_imovel: string;
  titulo: string;
  status_imovel: 'Disponível' | 'Reservado' | 'Vendido' | 'Suspenso';
  valor_venda: number | null;
  valor_locacao: number | null;
  bairro: string;
  cidade: string;
  uf: string;
  destaque: boolean;
  ativo: boolean;
  imagem_capa?: string;
}

const MOCK_IMOVEIS: ImovelRow[] = [
  {
    id: '1',
    codigo_imovel: 'AP0012',
    titulo: 'Cobertura Duplex Frontal Mar',
    status_imovel: 'Disponível',
    valor_venda: 12500000,
    valor_locacao: null,
    bairro: 'Leblon',
    cidade: 'Rio de Janeiro',
    uf: 'RJ',
    destaque: true,
    ativo: true,
    imagem_capa: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: '2',
    codigo_imovel: 'CA0455',
    titulo: 'Casa Contemporânea em Condomínio',
    status_imovel: 'Reservado',
    valor_venda: 8900000,
    valor_locacao: 45000,
    bairro: 'Barra da Tijuca',
    cidade: 'Rio de Janeiro',
    uf: 'RJ',
    destaque: false,
    ativo: true,
    imagem_capa: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: '3',
    codigo_imovel: 'AP0089',
    titulo: 'Apartamento Reformado Ipanema',
    status_imovel: 'Vendido',
    valor_venda: 4200000,
    valor_locacao: null,
    bairro: 'Ipanema',
    cidade: 'Rio de Janeiro',
    uf: 'RJ',
    destaque: true,
    ativo: false,
    imagem_capa: 'https://images.unsplash.com/photo-1600607687940-c52fb0a46303?auto=format&fit=crop&q=80&w=200'
  }
];

const Imoveis: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const formatCurrency = (value: number | null) => {
    if (value === null) return '---';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-['Inter',_sans-serif] antialiased">
      <Sidebar />

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header Superior - Contexto Administrativo */}
        <header className="h-20 w-full bg-white/70 backdrop-blur-xl border-b border-slate-100/80 flex items-center px-8 md:px-12 justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-slate-300">
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Dashboard</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Gestão de Imóveis</span>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="text-right">
                <p className="text-xs font-black text-slate-900 uppercase tracking-tight leading-none">Marlon Sales</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Master Broker</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-indigo-200 transition-all">
                <Icons.Users />
              </div>
            </div>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main className="p-8 md:p-12 max-w-[1600px] mx-auto w-full space-y-12 animate-in fade-in duration-700">
          
          {/* Header de Ações */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-2">
              <h2 className="text-4xl md:text-5xl font-black text-slate-950 uppercase tracking-tighter leading-[0.85]">
                Catálogo de <span className="text-slate-300">Propriedades</span>
              </h2>
              <p className="text-slate-500 text-sm font-medium tracking-tight">
                Gerencie anúncios, visibilidade e status do seu inventário imobiliário.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Buscar por código ou título..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 outline-none focus:border-indigo-200 focus:ring-4 focus:ring-indigo-500/5 transition-all w-64 md:w-96 shadow-sm"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
              </div>
              <button 
                onClick={() => navigate('/imoveis/novo')}
                className="px-8 py-4 bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-95 flex items-center gap-3"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                Novo Imóvel
              </button>
            </div>
          </div>

          {/* Listagem em Tabela Premium */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-white">
              <div className="flex items-center gap-8">
                <div>
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Listagem Geral</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total de {MOCK_IMOVEIS.length} unidades cadastradas</p>
                </div>
                <div className="hidden md:flex gap-4">
                  <div className="px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 text-[9px] font-black text-emerald-600 uppercase tracking-widest">Ativos: 12</div>
                  <div className="px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100 text-[9px] font-black text-indigo-600 uppercase tracking-widest">Destaques: 4</div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/40">
                  <tr>
                    <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Propriedade</th>
                    <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Localização</th>
                    <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Valores (Venda / Locação)</th>
                    <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Status & Visibilidade</th>
                    <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {MOCK_IMOVEIS.map((imovel) => (
                    <tr key={imovel.id} className="group hover:bg-slate-50/50 transition-colors cursor-default">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <img 
                              src={imovel.imagem_capa} 
                              className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-sm" 
                              alt="" 
                            />
                            {!imovel.ativo && (
                              <div className="absolute inset-0 bg-white/60 rounded-2xl flex items-center justify-center">
                                <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-black text-slate-950 uppercase tracking-tight">{imovel.titulo}</div>
                            <div className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-1">CÓD: {imovel.codigo_imovel}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{imovel.bairro}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{imovel.cidade} / {imovel.uf}</p>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="space-y-1">
                          <p className="text-xs font-black text-slate-950 tracking-tight">{formatCurrency(imovel.valor_venda)}</p>
                          {imovel.valor_locacao && (
                            <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Locação: {formatCurrency(imovel.valor_locacao)}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                            imovel.status_imovel === 'Disponível' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            imovel.status_imovel === 'Reservado' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-slate-100 text-slate-400 border-slate-200'
                          }`}>
                            {imovel.status_imovel}
                          </span>
                          {imovel.destaque && (
                            <span className="px-3 py-1.5 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-indigo-100">
                              Destaque
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <button className="p-2.5 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-slate-400 hover:text-indigo-600">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                          </button>
                          <button className="p-2.5 bg-slate-50 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 rounded-xl transition-all text-slate-400 hover:text-indigo-600">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                          </button>
                          <button className="p-2.5 bg-slate-50 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all text-slate-400 hover:text-rose-600">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-8 bg-slate-50/30 border-t border-slate-50 text-center">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Sincronizado com Supabase Database v2.48</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Imoveis;
