
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Icons } from '../constants';

const MOCK_IMOVEIS = [
  {
    id: '1',
    titulo: 'Cobertura Duplex Leblon',
    bairro: 'Leblon',
    cidade: 'Rio de Janeiro',
    valor: 'R$ 12.500.000',
    status: 'Ativo',
    destaque: true,
    views: '1.2k',
    leads: 24,
    imagem: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: '2',
    titulo: 'Apartamento Garden Ipanema',
    bairro: 'Ipanema',
    cidade: 'Rio de Janeiro',
    valor: 'R$ 8.900.000',
    status: 'Ativo',
    destaque: false,
    views: '850',
    leads: 12,
    imagem: 'https://images.unsplash.com/photo-1600607687940-c52fb0a46303?auto=format&fit=crop&q=80&w=150'
  },
  {
    id: '3',
    titulo: 'Casa Contemporânea Barra',
    bairro: 'Barra da Tijuca',
    cidade: 'Rio de Janeiro',
    valor: 'R$ 15.200.000',
    status: 'Inativo',
    destaque: true,
    views: '2.4k',
    leads: 45,
    imagem: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=150'
  }
];

const Imovel: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-['Inter',_sans-serif] antialiased">
      <Sidebar />

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Header Premium */}
        <header className="h-20 w-full bg-white/70 backdrop-blur-xl border-b border-slate-100/80 flex items-center px-8 md:px-12 justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-slate-300">
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Dashboard</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Propriedades</span>
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

        {/* Content Area */}
        <main className="p-8 md:p-12 max-w-[1600px] mx-auto w-full space-y-12 animate-in fade-in duration-700">
          
          {/* Page Header & Stats Summary */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-2">
              <h2 className="text-4xl md:text-5xl font-black text-slate-950 uppercase tracking-tighter leading-[0.85]">
                Gestão de <span className="text-slate-300">Propriedades</span>
              </h2>
              <p className="text-slate-500 text-sm font-medium tracking-tight">
                Controle total sobre o catálogo de imóveis, visibilidade e performance de anúncios.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Buscar imóvel..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 outline-none focus:border-indigo-200 focus:ring-4 focus:ring-indigo-500/5 transition-all w-64 md:w-80 shadow-sm"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
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

          {/* Table Card */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-white">
              <div className="flex items-center gap-8">
                <div>
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Catálogo Ativo</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Listagem geral de unidades</p>
                </div>
                <div className="hidden md:flex gap-4">
                  <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">Total: 42</div>
                  <div className="px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100 text-[9px] font-black text-indigo-600 uppercase tracking-widest">Destaques: 08</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors">
                  <Icons.Dashboard />
                </button>
                <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors">
                  <Icons.Settings />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/40">
                  <tr>
                    <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Propriedade</th>
                    <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Localização</th>
                    <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Investimento</th>
                    <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Performance</th>
                    <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {MOCK_IMOVEIS.map((imovel) => (
                    <tr key={imovel.id} className="group hover:bg-slate-50/50 transition-colors cursor-default">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <img src={imovel.imagem} className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-sm" alt="" />
                          <div>
                            <div className="text-xs font-black text-slate-950 uppercase tracking-tight">{imovel.titulo}</div>
                            <div className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-1">Ref: #00{imovel.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{imovel.bairro}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{imovel.cidade}</p>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <span className="text-xs font-black text-slate-950 tracking-tight">{imovel.valor}</span>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-[10px] font-black text-slate-900">{imovel.views}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Views</p>
                          </div>
                          <div className="w-px h-6 bg-slate-100"></div>
                          <div className="text-center">
                            <p className="text-[10px] font-black text-indigo-600">{imovel.leads}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Leads</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                            imovel.status === 'Ativo' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}>
                            <div className={`w-1 h-1 rounded-full ${imovel.status === 'Ativo' ? 'bg-emerald-600' : 'bg-slate-400'}`}></div>
                            {imovel.status}
                          </span>
                          {imovel.destaque && (
                            <span className="px-3 py-1 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-indigo-100">
                              Destaque
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2.5 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-slate-400 hover:text-indigo-600">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
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
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Exibindo {MOCK_IMOVEIS.length} de 42 propriedades cadastradas</p>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default Imovel;
