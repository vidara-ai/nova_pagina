
import React from 'react';
import { Icons } from '../constants';

const SidebarItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean }> = ({ icon, label, active }) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
    active 
      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
  }`}>
    {icon}
    <span className="font-medium">{label}</span>
  </div>
);

const Sidebar: React.FC = () => {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 p-6 hidden lg:flex flex-col gap-8 z-50">
      <div className="flex items-center gap-3 px-2">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
          N
        </div>
        <span className="text-xl font-bold text-slate-900 tracking-tight">NovaDash</span>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-4">Menu</div>
        <SidebarItem icon={<Icons.Dashboard />} label="Painel" active />
        <SidebarItem icon={<Icons.Users />} label="Usuários" />
        <SidebarItem icon={<Icons.Orders />} label="Vendas" />
        
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-6 px-4">Configuração</div>
        <SidebarItem icon={<Icons.Settings />} label="Ajustes" />
      </nav>

      <div className="bg-slate-50 rounded-2xl p-4">
        <div className="text-sm font-semibold text-slate-900">Plano Pro</div>
        <p className="text-xs text-slate-500 mt-1">Expira em 12 dias. Renove agora para continuar crescendo.</p>
        <button className="w-full mt-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors">
          Renovar Agora
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
