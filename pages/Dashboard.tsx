
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [stats, setStats] = useState({
    ativos: 0,
    inativos: 0,
    leadsTotal: 0,
    leadsSite: 0,
    leadsWA: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoadingLeads(true);
      
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('id, nome, telefone, imovel_interesse, origem, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (leadsError) throw leadsError;
      setRecentLeads(leadsData || []);

      const [
        { count: ativosCount },
        { count: inativosCount },
        { count: totalLeadsCount },
        { count: siteLeadsCount },
        { count: waLeadsCount }
      ] = await Promise.all([
        supabase.from('imoveis').select('*', { count: 'exact', head: true }).eq('ativo', true),
        supabase.from('imoveis').select('*', { count: 'exact', head: true }).eq('ativo', false),
        supabase.from('leads').select('*', { count: 'exact', head: true }),
        supabase.from('leads').select('*', { count: 'exact', head: true }).neq('origem', 'whatsapp'),
        supabase.from('leads').select('*', { count: 'exact', head: true }).eq('origem', 'whatsapp')
      ]);

      setStats({
        ativos: ativosCount || 0,
        inativos: inativosCount || 0,
        leadsTotal: totalLeadsCount || 0,
        leadsSite: siteLeadsCount || 0,
        leadsWA: waLeadsCount || 0
      });

    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err);
    } finally {
      setLoadingLeads(false);
    }
  };

  const metrics = [
    { 
      title: 'Imóveis Ativos', 
      value: stats.ativos.toString(), 
      change: '--', 
      isPositive: true, 
      icon: <Icons.Dashboard />,
      onClick: () => navigate('/imoveis?ativo=true')
    },
    { 
      title: 'Imóveis Inativos', 
      value: stats.inativos.toString(), 
      change: '--', 
      isPositive: false, 
      icon: <Icons.Building />,
      onClick: () => navigate('/imoveis?ativo=false')
    },
    { 
      title: 'Total de Leads', 
      value: stats.leadsTotal.toString(), 
      change: '--', 
      isPositive: true, 
      icon: <Icons.Users /> 
    },
    { 
      title: 'Origem (SITE / WA)', 
      value: `${stats.leadsSite} / ${stats.leadsWA}`, 
      change: '--', 
      isPositive: true, 
      icon: <Icons.Settings /> 
    },
  ];

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
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        
        <header className="h-20 w-full bg-white/70 backdrop-blur-xl border-b border-slate-100/80 flex items-center px-6 md:px-12 justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {/* Botão Menu Hambúrguer (Mobile) */}
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-indigo-600 transition-colors"
              aria-label="Abrir menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="hidden md:flex items-center gap-2 text-slate-300">
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Home</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Dashboard</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-8">
            <div className="flex items-center gap-3 md:gap-4 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-900 uppercase tracking-tight leading-none">Marlon Sales</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Administrador</p>
              </div>
              <div className="w-9 h-9 md:w-10 md:h-10 bg-slate-100 rounded-xl md:rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-indigo-200 group-hover:text-indigo-600 transition-all">
                <Icons.Users />
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 md:p-12 max-w-[1600px] mx-auto w-full space-y-10 md:space-y-12 animate-in fade-in duration-700">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-5xl font-black text-slate-950 uppercase tracking-tighter leading-[0.85]">
                Painel de <span className="text-slate-300">Resumo</span>
              </h2>
              <p className="text-slate-500 text-xs md:text-sm font-medium tracking-tight">
                Gestão centralizada de leads, propriedades e performance operacional.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {metrics.map((metric, idx) => (
              <StatCard key={idx} {...metric} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-8 items-start">
            
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden flex flex-col">
              <div className="px-6 md:px-10 py-6 md:py-8 border-b border-slate-50 flex justify-between items-center bg-white">
                <div>
                  <h3 className="text-[10px] md:text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Leads Recentes</h3>
                  <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Últimas interações</p>
                </div>
                <button 
                  onClick={() => navigate('/leads')}
                  className="text-[9px] md:text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-[0.2em] transition-colors"
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
                      className="group flex items-center gap-4 md:gap-6 px-6 md:px-10 py-5 md:py-6 hover:bg-slate-50 transition-colors duration-200 cursor-pointer border-b border-slate-50 last:border-0"
                    >
                      <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded-xl md:rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs md:text-sm uppercase transition-transform group-hover:scale-105">
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

                      <div className="hidden lg:block">
                        <span className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 group-hover:border-indigo-100 transition-all">
                          {lead.origem}
                        </span>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="text-[9px] md:text-[10px] font-black text-slate-950 uppercase tracking-tighter">
                          {formatDateTime(lead.created_at)}
                        </div>
                        <div className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-0.5 hidden sm:block">
                          Enviado em
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
