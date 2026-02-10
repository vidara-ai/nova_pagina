
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Icons } from '../constants';

const MOCK_LEADS = [
  {
    id: '1',
    nome: 'Ricardo Almeida',
    email: 'ricardo.almeida@email.com',
    imovel: 'Cobertura Leblon Vista Mar',
    status: 'Novo',
    data: '15 Mai, 2024',
    avatar: 'RA'
  },
  {
    id: '2',
    nome: 'Juliana Cavalcanti',
    email: 'ju.cavalcanti@gmail.com',
    imovel: 'Apartamento Garden Ipanema',
    status: 'Em Atendimento',
    data: '14 Mai, 2024',
    avatar: 'JC'
  },
  {
    id: '3',
    nome: 'Marcos Oliveira',
    email: 'm.oliveira@outlook.com',
    imovel: 'Casa de Vila Botafogo',
    status: 'Finalizado',
    data: '12 Mai, 2024',
    avatar: 'MO'
  },
  {
    id: '4',
    nome: 'Fernanda Lima',
    email: 'fer.lima@icloud.com',
    imovel: 'Studio Design Copacabana',
    status: 'Novo',
    data: '10 Mai, 2024',
    avatar: 'FL'
  }
];

const Leads: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-['Inter',_sans-serif] antialiased">
      {/* Sidebar Reutilizada */}
      <Sidebar />

      {/* Main Layout Container */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        
        {/* Header Administrativo Premium */}
        <header className="h-20 w-full bg-white/70 backdrop-blur-xl border-b border-slate-100/80 flex items-center px-8 md:px-12 justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-slate-300">
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Dashboard</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Gestão de Leads</span>
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
        <main className="p-8 md:p-12 max-w-[1400px] mx-auto w-full space-y-12 animate-in fade-in duration-700">
          
          {/* Page Header & Stats Summary */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-2">
              <h2 className="text-4xl md:text-5xl font-black text-slate-950 uppercase tracking-tighter leading-[0.85]">
                Fluxo de <span className="text-slate-300">Interessados</span>
              </h2>
              <p className="text-slate-500 text-sm font-medium tracking-tight">
                Acompanhe e gerencie as solicitações de contato recebidas pela Vitrine Digital.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Buscar interessado..."
                  className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 outline-none focus:border-indigo-200 focus:ring-4 focus:ring-indigo-500/5 transition-all w-64 md:w-80"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Leads Table Card */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-white">
              <div className="flex items-center gap-8">
                <div>
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Base de Leads</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sincronizado em tempo real</p>
                </div>
                <div className="hidden md:flex gap-4">
                  <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">Todos: 42</div>
                  <div className="px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100 text-[9px] font-black text-indigo-600 uppercase tracking-widest">Novos: 12</div>
                </div>
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
                    <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Imóvel de Interesse</th>
                    <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Data de Entrada</th>
                    <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {MOCK_LEADS.map((lead) => (
                    <tr key={lead.id} className="group hover:bg-slate-50/50 transition-colors cursor-default">
                      <td className="px-10 py-7">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-[10px]">
                            {lead.avatar}
                          </div>
                          <div>
                            <div className="text-xs font-black text-slate-950 uppercase tracking-tight">{lead.nome}</div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{lead.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-7">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight line-clamp-1">{lead.imovel}</span>
                          <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Venda • Residencial</span>
                        </div>
                      </td>
                      <td className="px-10 py-7">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">{lead.data}</span>
                      </td>
                      <td className="px-10 py-7">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                          lead.status === 'Novo' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                          lead.status === 'Em Atendimento' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                          'bg-emerald-50 border-emerald-100 text-emerald-600'
                        }`}>
                          <div className={`w-1 h-1 rounded-full ${
                            lead.status === 'Novo' ? 'bg-indigo-600 animate-pulse' :
                            lead.status === 'Em Atendimento' ? 'bg-amber-600' :
                            'bg-emerald-600'
                          }`}></div>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-10 py-7 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2.5 bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-xl transition-all text-slate-400">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                          </button>
                          <button className="px-4 py-2.5 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all">
                            Gerenciar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State Mockup */}
            {MOCK_LEADS.length === 0 && (
              <div className="py-32 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
                  <Icons.Users />
                </div>
                <div>
                  <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Nenhum lead encontrado</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Tente ajustar seus filtros de busca</p>
                </div>
              </div>
            )}

            <div className="p-8 bg-slate-50/30 border-t border-slate-50 text-center">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Visualizando 4 de 42 registros</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Leads;
