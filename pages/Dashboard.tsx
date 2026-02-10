
import React from 'react';
import { Icons } from '../constants';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatCard from '../components/StatCard';

const Dashboard: React.FC = () => {
  // Métricas com placeholders '--' para futura integração com Supabase
  const metrics = [
    { title: 'Imóveis Ativos', value: '--', change: '--%', isPositive: true, icon: <Icons.Dashboard /> },
    { title: 'Novos Leads', value: '--', change: '--%', isPositive: true, icon: <Icons.Users /> },
    { title: 'Visualizações', value: '--k', change: '--%', isPositive: false, icon: <Icons.Orders /> },
    { title: 'Conversão', value: '--%', change: '--', isPositive: true, icon: <Icons.Settings /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-['Inter',_sans-serif]">
      {/* Sidebar Fixa à Esquerda */}
      <Sidebar />

      {/* Conteúdo Principal */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        
        {/* Header do Dashboard - Adaptado para o contexto administrativo */}
        <div className="h-20 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center px-8 justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-black text-slate-900 uppercase tracking-tighter">
              Console <span className="text-indigo-600">Administrativo</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Marlon Sales</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Master Broker</p>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer group">
              <Icons.Users />
              <div className="absolute top-0 right-0 w-3 h-3 bg-rose-500 border-2 border-white rounded-full"></div>
            </div>
          </div>
        </div>

        <main className="p-8 md:p-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Welcome & Global Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                Painel de <span className="text-slate-400">Controle</span>
              </h2>
              <p className="text-slate-500 text-sm font-medium mt-3 max-w-md">
                Bem-vindo de volta. Aqui está o resumo operacional das suas propriedades e interações.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-6 py-3.5 bg-white border border-slate-200 text-slate-600 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
                Relatórios
              </button>
              <button className="px-6 py-3.5 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-slate-200 hover:bg-indigo-600 hover:-translate-y-0.5 transition-all flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                Novo Imóvel
              </button>
            </div>
          </div>

          {/* Métricas Principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, idx) => (
              <StatCard key={idx} {...metric} />
            ))}
          </div>

          {/* Seção Inferior: Tabela e Widget de Destaque */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Tabela de Leads Recentes com Visual Premium */}
            <div className="xl:col-span-2 bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Leads Recentes</h3>
                <button className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest transition-colors flex items-center gap-2">
                  Ver Banco de Dados
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Interessado</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Imóvel Alvo</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[1, 2, 3, 4].map((i) => (
                      <tr key={i} className="group hover:bg-slate-50/30 transition-all duration-300">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-300 font-black text-xs">
                              --
                            </div>
                            <div>
                              <div className="text-sm font-black text-slate-900 uppercase tracking-tight">Sincronizando...</div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aguardando dados</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-xs font-bold text-slate-600 uppercase tracking-tight italic">Nenhum imóvel vinculado</span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 animate-pulse"></div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Pendente</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-indigo-600">
                             <Icons.Settings />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="p-8 bg-slate-50/50 text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Fim da lista de sincronização</p>
              </div>
            </div>

            {/* Banner Lateral de Insights Premium */}
            <div className="flex flex-col gap-6">
              <div className="bg-indigo-600 rounded-[3rem] p-10 text-white flex flex-col justify-between shadow-2xl shadow-indigo-200 relative overflow-hidden h-full min-h-[480px]">
                {/* Background Decorativo */}
                <div className="absolute top-0 right-0 p-12 opacity-10 transform translate-x-12 -translate-y-12 scale-[2.5] rotate-12">
                  <Icons.Dashboard />
                </div>
                
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/10">
                    <Icons.Settings />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-200 mb-6 block">Performance Insight</span>
                  <h3 className="text-3xl font-black uppercase tracking-tighter leading-tight mb-6">
                    Melhore seu <span className="text-indigo-300">Alcance</span> em até 40%
                  </h3>
                  <p className="text-indigo-100 text-sm font-medium leading-relaxed opacity-80">
                    Imóveis com tours virtuais e fotos em 4K recebem prioridade no algoritmo de busca da Vitrine Digital.
                  </p>
                </div>

                <div className="relative z-10 space-y-6">
                  <div className="p-6 bg-white/5 backdrop-blur-sm rounded-[2rem] border border-white/10 group cursor-pointer hover:bg-white/10 transition-colors">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200 mb-2">Sugestão Técnica</p>
                    <p className="text-sm font-bold">Atualizar metadados das capas</p>
                  </div>
                  <button className="w-full py-5 bg-white text-indigo-600 text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-indigo-50 transition-all shadow-xl active:scale-95">
                    Otimizar Agora
                  </button>
                </div>
              </div>

              {/* Card de Status do Servidor/API */}
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]"></div>
                  <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Supabase Online</span>
                </div>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">v2.48.1</span>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
