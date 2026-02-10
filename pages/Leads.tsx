
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Icons } from '../constants';
import { supabase } from '../services/supabase';

interface Lead {
  id: string;
  nome: string | null;
  telefone: string | null;
  email: string | null;
  mensagem: string | null;
  origem: string;
  imovel_id: string | null;
  pagina_origem: string | null;
  created_at: string;
  imovel_interesse: string | null;
}

const Leads: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leads')
        .select(`
          id,
          nome,
          telefone,
          email,
          mensagem,
          origem,
          imovel_id,
          pagina_origem,
          created_at,
          imovel_interesse
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (err) {
      console.error('Erro ao buscar leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = leads.filter(lead => 
    (lead.nome?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (lead.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (lead.imovel_interesse?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}, ${hours}:${minutes}`;
  };

  const handleWhatsApp = (lead: Lead) => {
    if (!lead.telefone) return;
    
    const cleanPhone = lead.telefone.replace(/\D/g, '');
    const nome = lead.nome ?? '—';
    const origem = lead.origem ?? '—';
    const interesse = lead.imovel_interesse ?? '—';
    const pagina = lead.pagina_origem ?? '—';

    const message = `Olá, ${nome} 👋
Recebemos seu contato pelo site.

📌 Origem: ${origem}
🏠 Interesse: ${interesse}
🌐 Página: ${pagina}

Se precisar de algo, é só responder por aqui 🙂`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/55${cleanPhone}?text=${encodedMessage}`, '_blank');
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

        <main className="p-8 md:p-12 max-w-[1400px] mx-auto w-full space-y-12 animate-in fade-in duration-700">
          
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 outline-none focus:border-indigo-200 focus:ring-4 focus:ring-indigo-500/5 transition-all w-64 md:w-80 shadow-sm"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-white">
              <div className="flex items-center gap-8">
                <div>
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Base de Leads</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sincronizado via Supabase</p>
                </div>
                {!loading && (
                  <div className="hidden md:flex gap-4">
                    <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">Registros: {leads.length}</div>
                  </div>
                )}
              </div>
              <button onClick={fetchLeads} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors">
                <Icons.Dashboard />
              </button>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="py-32 flex flex-col items-center justify-center text-center space-y-4">
                   <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Carregando leads...</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50/40">
                    <tr>
                      <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Interessado</th>
                      <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Imóvel de Interesse</th>
                      <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Data de Entrada</th>
                      <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Origem</th>
                      <th className="px-10 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id} className="group hover:bg-slate-50/50 transition-colors cursor-default">
                        <td className="px-10 py-7">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-[10px]">
                              {(lead.nome?.[0] || '?').toUpperCase()}
                            </div>
                            <div>
                              <div className="text-xs font-black text-slate-950 uppercase tracking-tight">
                                {lead.nome ?? 'Cliente não identificado'}
                              </div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                {lead.telefone ?? 'Sem telefone cadastrado'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-7">
                          <div className="space-y-1">
                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight line-clamp-1">
                              {lead.imovel_interesse ?? '—'}
                            </span>
                          </div>
                        </td>
                        <td className="px-10 py-7">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">
                            {formatDateTime(lead.created_at)}
                          </span>
                        </td>
                        <td className="px-10 py-7">
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-100 bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-600">
                            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                            {lead.origem}
                          </span>
                        </td>
                        <td className="px-10 py-7 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-100">
                            <button 
                              onClick={() => handleWhatsApp(lead)}
                              disabled={!lead.telefone}
                              className="px-5 py-2.5 bg-[#25D366] text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-green-100 hover:bg-[#20ba5a] hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              WhatsApp
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {!loading && filteredLeads.length === 0 && (
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
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
                {loading ? 'Carregando registros...' : `Visualizando ${filteredLeads.length} de ${leads.length} registros`}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Leads;
