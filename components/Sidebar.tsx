
import React from 'react';
import { Icons } from '../constants';

const SidebarItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean }> = ({ icon, label, active }) => (
  <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl cursor-pointer transition-all duration-300 group ${
    active 
      ? 'bg-slate-950 text-white shadow-2xl shadow-slate-200' 
      : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
  }`}>
    <div className={`${active ? 'text-indigo-400' : 'text-slate-300 group-hover:text-indigo-600'} transition-colors`}>
      {icon}
    </div>
    <span className="text-[11px] font-black uppercase tracking-[0.2em]">{label}</span>
  </div>
);

const Sidebar: React.FC = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-100/80 p-8 hidden lg:flex flex-col gap-12 z-50">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-2 cursor-pointer group">
        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100 group-hover:rotate-6 transition-transform">
          N
        </div>
        <span className="text-xl font-black text-slate-900 tracking-tighter uppercase">
          Nova<span className="text-indigo-600">Dash</span>
        </span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 flex flex-col gap-3">
        <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] mb-4 px-6">Geral</div>
        <SidebarItem icon={<Icons.Dashboard />} label="Resumo" active />
        <SidebarItem icon={<Icons.Users />} label="Leads" />
        <SidebarItem icon={<Icons.Orders />} label="Propriedades" />
        
        <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] mb-4 mt-8 px-6">Sistema</div>
        <SidebarItem icon={<Icons.Settings />} label="Ajustes" />
      </nav>

      {/* Account Widget */}
      <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
        <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Plano Corporate</div>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-2 leading-relaxed">
          Suporte prioritário ativo até 2026.
        </p>
        <button className="w-full mt-6 py-3 bg-white border border-slate-200 hover:border-indigo-600 hover:text-indigo-600 text-slate-900 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-sm">
          Gerenciar Assinatura
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
