
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Icons } from '../constants';
import { supabase } from '../services/supabase';
import { Imovel } from '../types';

const Imoveis: React.FC = () => {
  const navigate = useNavigate();
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchImoveis();
  }, []);

  async function fetchImoveis() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('imoveis')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImoveis(data || []);
    } catch (err) {
      console.error('Erro ao carregar imóveis:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este imóvel?')) return;

    try {
      const { error } = await supabase.from('imoveis').delete().eq('id', id);
      if (error) throw error;
      setImoveis(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      alert('Erro ao excluir imóvel');
    }
  }

  const filteredImoveis = imoveis.filter(item => 
    item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.codigo_imovel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (val: number | null) => {
    if (!val) return '---';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-['Inter',_sans-serif] antialiased">
      <Sidebar />

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <header className="h-20 w-full bg-white/70 backdrop-blur-xl border-b border-slate-100/80 flex items-center px-8 md:px-12 justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-slate-300">
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Dashboard</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Imóveis</span>
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

        <main className="p-8 md:p-12 max-w-[1600px] mx-auto w-full space-y-12 animate-in fade-in duration-700">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-2">
              <h2 className="text-4xl md:text-5xl font-black text-slate-950 uppercase tracking-tighter leading-[0.85]">
                Gestão de <span className="text-slate-300">Imóveis</span>
              </h2>
              <p className="text-slate-500 text-sm font-medium tracking-tight">
                Visualize e controle seu catálogo de propriedades.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Cód ou Título..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 outline-none focus:border-indigo-200 focus:ring-4 focus:ring-indigo-500/5 transition-all w-64 md:w-80 shadow-sm"
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

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
            {loading ? (
              <div className="p-20 text-center animate-pulse">
                <div className="w-12 h-12 bg-slate-100 rounded-full mx-auto mb-4"></div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Carregando catálogo...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/40">
                    <tr>
                      <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">CÓD.</th>
                      <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Imóvel</th>
                      <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Valor</th>
                      <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                      <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredImoveis.map((item) => (
                      <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors cursor-default">
                        <td className="px-10 py-6">
                          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{item.codigo_imovel}</span>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-950 uppercase tracking-tight">{item.titulo}</span>
                              {item.destaque && (
                                <span className="bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded text-[8px] font-black uppercase">⭐ Destaque</span>
                              )}
                            </div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.bairro}, {item.cidade}</span>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-900 uppercase">
                              {item.finalidade === 'venda' ? formatCurrency(item.valor_venda) : formatCurrency(item.valor_locacao)}
                            </span>
                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                              {item.finalidade === 'venda' ? 'Venda' : 'Locação'}
                            </span>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                            item.ativo ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}>
                            <div className={`w-1 h-1 rounded-full ${item.ativo ? 'bg-emerald-600' : 'bg-slate-400'}`}></div>
                            {item.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button 
                              onClick={() => navigate(`/imoveis/${item.id}`)}
                              className="p-2.5 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all text-slate-400 hover:text-indigo-600"
                            >
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                            </button>
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="p-2.5 bg-slate-50 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all text-slate-400 hover:text-rose-600"
                            >
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Imoveis;
