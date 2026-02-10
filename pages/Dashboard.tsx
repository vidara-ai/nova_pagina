
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../constants';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { supabase } from '../services/supabase';

interface Lead {
  id: string;
  nome: string | null;
  telefone: string | null;
  imovel_interesse: string | null;
  origem: string;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);

  // Métricas com placeholders '--' prontas para integração
  const metrics = [
    { title: 'Imóveis Ativos', value: '--', change: '--%', isPositive: true, icon: <Icons.Dashboard /> },
    { title: 'Novos Leads', value: '--', change: '--%', isPositive: true, icon: <Icons.Users /> },
    { title: 'Visualizações', value: '--k', change: '--%', isPositive: false, icon: <Icons.Orders /> },
    { title: 'Conversão', value: '--%', change: '--', isPositive: true, icon: <Icons.Settings /> },
  ];

  useEffect(() => {
    fetchRecentLeads();
  }, []);

  const fetchRecentLeads = async () => {
    try {
      setLoadingLeads(true);
      const { data, error } = await supabase
        .from('leads')
        .select('id, nome, telefone, imovel_interesse, origem, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentLeads(data || []);
    } catch (err) {
      console.error('Erro ao buscar leads recentes:', err);
    } finally {
      setLoadingLeads(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}, ${hours}:${minutes}`;
  };

  const openWhatsApp = (lead: Lead) => {
    if (!lead.telefone) return;
    const cleanPhone = lead.telefone.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanPhone}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-['Inter',_sans-serif] antialiased">
      <Sidebar />

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        
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

        <main className="p-8 md:p-12 max-w-[1600px] mx-auto w-full space-y-12 animate-in fade-in duration-700">
          
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
              <button onClick={() => navigate('/imoveis/novo')} className="px-7 py-4 bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-95 flex items-center gap-3">
                <Icons.Plus />
                Cadastrar Imóvel
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, idx) => (
              <StatCard key={idx} {...metric} />
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            
            {/* Bloco Leads Recentes */}
            <div className="xl:col-span-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden flex flex-col">
              <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-white">
                <div>
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Leads Recentes</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Últimas interações</p>
                </div>
                <button 
                  onClick={() => navigate('/leads')}
                  className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-[0.2em] transition-colors"
                >
                  Ver todos
                </button>
              </div>
              
              <div className="flex flex-col">
                {loadingLeads ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-4">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Sincronizando Leads...</p>
                  </div>
                ) : recentLeads.length === 0 ? (
                  <div className="py-20 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nenhum lead registrado</p>
                  </div>
                ) : (
                  recentLeads.map((lead) => (
                    <div 
                      key={lead.id}
                      onClick={() => openWhatsApp(lead)}
                      className="group flex items-center gap-6 px-10 py-6 hover:bg-slate-50 transition-colors duration-200 cursor-pointer border-b border-slate-50 last:border-0"
                    >
                      <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm uppercase transition-transform group-hover:scale-105">
                        {lead.nome ? lead.nome[0] : '?'}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-black text-slate-900 uppercase tracking-tight truncate">
                          {lead.nome || 'Interessado Anônimo'}
                        </div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">
                          {lead.imovel_interesse || 'Interesse Geral'}
                        </div>
                      </div>

                      <div className="hidden md:block">
                        <span className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 group-hover:border-indigo-100 transition-all">
                          {lead.origem}
                        </span>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] font-black text-slate-950 uppercase tracking-tighter">
                          {formatDateTime(lead.created_at)}
                        </div>
                        <div className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">
                          Enviado em
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="xl:col-span-4 space-y-6">
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
