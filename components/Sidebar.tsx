
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icons } from '../constants';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const SidebarItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean;
  onClick?: () => void;
}> = ({ icon, label, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-4 px-6 py-4 rounded-2xl cursor-pointer transition-all duration-300 group ${
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

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path: string) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Backdrop para Mobile */}
      <div 
        className={`fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside className={`fixed left-0 top-0 h-screen w-72 lg:w-64 bg-white border-r border-slate-100/80 p-8 flex flex-col gap-12 z-[70] transition-transform duration-500 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2">
          <div 
            onClick={() => handleNavigate('/')}
            className="flex flex-col cursor-pointer"
          >
            <span className="text-lg font-black text-slate-950 tracking-tighter uppercase leading-none">
              Painel<br />
              <span className="text-indigo-600">Administrativo</span>
            </span>
          </div>
          
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 flex flex-col gap-3">
          <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] mb-4 px-6">Geral</div>
          <SidebarItem 
            icon={<Icons.Dashboard />} 
            label="Resumo" 
            active={location.pathname === '/dashboard'} 
            onClick={() => handleNavigate('/dashboard')}
          />
          <SidebarItem 
            icon={<Icons.Users />} 
            label="Leads" 
            active={location.pathname === '/leads'}
            onClick={() => handleNavigate('/leads')}
          />
          <SidebarItem 
            icon={<Icons.Building />} 
            label="Imóveis" 
            active={location.pathname.startsWith('/imoveis')}
            onClick={() => handleNavigate('/imoveis')}
          />
          
          <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] mb-4 mt-8 px-6">Sistema</div>
          <SidebarItem 
            icon={<Icons.Settings />} 
            label="Ajustes" 
            active={location.pathname === '/configuracoes'}
            onClick={() => handleNavigate('/configuracoes')}
          />
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
