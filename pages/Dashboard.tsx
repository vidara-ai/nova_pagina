
import React from 'react';
import { Icons } from '../constants';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatCard from '../components/StatCard';

const Dashboard: React.FC = () => {
  const metrics = [
    { title: 'Total de Imóveis', value: '1,284', change: '8.2%', isPositive: true, icon: <Icons.Dashboard /> },
    { title: 'Leads do Mês', value: '452', change: '12.5%', isPositive: true, icon: <Icons.Users /> },
    { title: 'Visualizações', value: '14.2k', change: '3.1%', isPositive: false, icon: <Icons.Orders /> },
    { title: 'Status do Plano', value: 'Ativo', change: 'Pro', isPositive: true, icon: <Icons.Settings /> },
  ];

  const recentLeads = [
    { id: 1, name: 'Alice Ferreira', email: 'alice.f@email.com', property: 'Apartamento Jardins', status: 'Novo', date: 'Há 5 min' },
    { id: 2, name: 'Bruno Santos', email: 'bruno.s@email.com', property: 'Casa Condomínio', status: 'Em contato', date: 'Há 22 min' },
    { id: 3, name: 'Carla Lima', email: 'carla.l@email.com', property: 'Cobertura Leblon', status: 'Qualificado', date: 'Há 1 hora' },
    { id: 4, name: 'Daniel Oliveira', email: 'd.oliveira@email.com', property: 'Studio Vila Madalena', status: 'Novo', date: 'Há 3 horas' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <Header />
        <main className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Visão Geral</h1>
              <p className="text-slate-500 text-sm mt-1">Bem-vindo ao seu painel de controle administrativo.</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                Exportar Relatório
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                Novo Imóvel
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, idx) => (
              <StatCard key={idx} {...metric} />
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="font-bold text-slate-900">Leads Recentes</h2>
                <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider">Ver todos</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cliente</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Interesse</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentLeads.map((lead) => (
                      <tr key={lead.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{lead.name}</div>
                            <div className="text-xs text-slate-400">{lead.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{lead.property}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            lead.status === 'Novo' ? 'bg-indigo-100 text-indigo-700' :
                            lead.status === 'Qualificado' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">{lead.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-indigo-600 rounded-[2rem] p-8 text-white flex flex-col justify-between shadow-2xl shadow-indigo-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-4 -translate-y-4">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                </svg>
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Dica do Dia</h3>
                <p className="text-indigo-100 text-sm leading-relaxed">
                  Imóveis com fotos profissionais recebem até 4x mais leads qualificados. Agende uma sessão hoje mesmo!
                </p>
              </div>
              <div className="relative z-10 mt-8">
                <button className="w-full py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors text-sm shadow-xl">
                  Agendar Fotógrafo
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
