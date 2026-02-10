
import React from 'react';
import { Icons } from '../constants';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';

const Dashboard: React.FC = () => {
  // Métricas com placeholders '--' prontas para integração
  const metrics = [
    { title: 'Imóveis Ativos', value: '--', change: '--%', isPositive: true, icon: <Icons.Dashboard /> },
    { title: 'Novos Leads', value: '--', change: '--%', isPositive: true, icon: <Icons.Users /> },
    { title: 'Visualizações', value: '--k', change: '--%', isPositive: false, icon: <Icons.Orders /> },
    { title: 'Conversão', value: '--%', change: '--', isPositive: true, icon: <Icons.Settings /> },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-['Inter',_sans-serif] antialiased">
      {/* Sidebar Fixa - Proporção Exata */}
      <Sidebar />

      {/* Main Layout Container */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        
        {/* Header Premium - Glassmorphism & Alignment */}
        <header className="h-20 w-full bg-white/70 backdrop-blur-xl border-b border-slate-100/80 flex items-center px-8 md:px-12 justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-slate-300">
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Home</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Dashboard</span>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="text-right">
                <p className="text-xs font-black text-slate-900 uppercase tracking-tight leading-none">Marlon Sales</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Administrador</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-indigo-200 group-hover:text-indigo-600 transition-all">
                <Icons.Users />
              </div>
            </div>
          </div>
        </header>

        {/* Dash Content Area */}
        <main className="p-8 md:p-12 max-w-[1600px] mx-auto w-full space-y-12 animate-in fade-in duration-700">
          
          {/* Welcome Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-2">
              <h2 className="text-4xl md:text-5xl font-black text-slate-950 uppercase tracking-tighter leading-[0.85]">
                Painel de <span className="text-slate-300">Resumo</span>
              </h2>
              <p className="text-slate-500 text-sm font-medium tracking-tight">
                Gestão centralizada de leads, propriedades e performance operacional.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="px-6 py-4 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95">
                Exportar Dados
              </button>
              <button className="px-7 py-4 bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-95 flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                </svg>
                Cadastrar Imóvel
              </button>
            </div>
          </div>

          {/* Grid de Métricas - Proporções de SaaS Premium */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, idx) => (
              <StatCard key={idx} {...metric} />
            ))}
          </div>

          {/* Seção Principal de Dados */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            
            {/* Tabela de Leads Recentes */}
            <div className="xl:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden flex flex-col">
              <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center">
                <div>
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Fluxo de Leads</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Últimas 24 horas</p>
                </div>
                <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors">
                  <Icons.Settings />
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/40">
                    <tr>
                      <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Interessado</th>
                      <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Propriedade Alvo</th>
                      <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                      <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="group hover:bg-slate-50/50 transition-colors cursor-default">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-black text-[10px]">
                              --
                            </div>
                            <div>
                              <div className="text-xs font-black text-slate-900 uppercase tracking-tight">Sincronizando...</div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">via API Supabase</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aguardando Vinculação</span>
                        </td>
                        <td className="px-10 py-6">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                            <div className="w-1 h-1 rounded-full bg-slate-300 animate-pulse"></div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pendente</span>
                          </div>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <button className="text-[9px] font-black text-slate-300 hover:text-indigo-600 uppercase tracking-widest transition-all">Detalhes</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sidebar Lateral de Ações e Status */}
            <div className="xl:col-span-4 space-y-6">
              {/* Banner de Performance */}
              <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden group shadow-2xl shadow-indigo-100">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                
                <div className="relative z-10 space-y-8">
                  <div className="w-12 h-12 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                    <Icons.Dashboard />
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">
                      Otimize seus <br /> <span className="text-indigo-200">Resultados</span>
                    </h3>
                    <p className="text-indigo-100/70 text-xs font-medium leading-relaxed">
                      Utilize nossa inteligência de dados para precificar seus imóveis conforme a demanda local.
                    </p>
                  </div>

                  <button className="w-full py-5 bg-white text-indigo-600 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-indigo-50 transition-all shadow-xl active:scale-95">
                    Ver Insights
                  </button>
                </div>
              </div>

              {/* Status do Sistema */}
              <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                    <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">API Gateway</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Supabase v2.48</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Online</p>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
