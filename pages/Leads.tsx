
import React, { useState, useEffect, useMemo } from 'react';
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
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrigem, setFilterOrigem] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este lead permanentemente?')) return;
    
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setLeads(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      alert('Erro ao excluir lead');
      console.error(err);
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

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = (lead.nome?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                            (lead.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                            (lead.imovel_interesse?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      const matchesOrigem = filterOrigem === '' || lead.origem === filterOrigem;
      
      const leadDate = new Date(lead.created_at);
      const matchesStartDate = startDate === '' || leadDate >= new Date(startDate + 'T00:00:00');
      const matchesEndDate = endDate === '' || leadDate <= new Date(endDate + 'T23:59:59');

      return matchesSearch && matchesOrigem && matchesStartDate && matchesEndDate;
    });
  }, [leads, searchTerm, filterOrigem, startDate, endDate]);

  const origensDisponiveis = useMemo(() => {
    const set = new Set(leads.map(l => l.origem));
    return Array.from(set).sort();
  }, [leads]);

  const exportCSV = () => {
    const headers = ['Nome', 'Telefone', 'Email', 'Origem', 'Interesse', 'Pagina Origem', 'Data'];
    const rows = filteredLeads.map(l => [
      l.nome ?? '—',
      l.telefone ?? '—',
      l.email ?? '—',
      l.origem ?? '—',
      l.imovel_interesse ?? '—',
      l.pagina_origem ?? '—',
      new Date(l.created_at).toLocaleString('pt-BR')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `leads_export_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-['Inter',_sans-serif] antialiased print:bg-white">
      <div className="print:hidden">
        <Sidebar />
      </div>

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0 print:ml-0">
        <header className="h-20 w-full bg-white/70 backdrop-blur-xl border-b border-slate-100/80 flex items-center px-8 md:px-12 justify-between sticky top-0 z-40 print:hidden">
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

        <main className="p-8 md:p-12 max-w-[1400px] mx-auto w-full space-y-12 animate-in fade-in duration-700 print:p-0 print:space-y-4">
          
          {/* Título e Ações Globais */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 print:hidden">
            <div className="space-y-2">
              <h2 className="text-4xl md:text-5xl font-black text-slate-950 uppercase tracking-tighter leading-[0.85]">
                GERENCIADOR DE <span className="text-slate-300">LEADS</span>
              </h2>
              <p className="text-slate-500 text-sm font-medium tracking-tight">
                Controle avançado de prospecções e contatos da Vitrine Digital.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={exportCSV}
                className="px-6 py-4 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
              >
                Exportar CSV
              </button>
              <button 
                onClick={exportPDF}
                className="px-6 py-4 bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-95"
              >
                Exportar PDF
              </button>
            </div>
          </div>

          <div className="hidden print:block mb-8">
             <h1 className="text-2xl font-black uppercase text-slate-900">Relatório de Leads - Vitrine Digital</h1>
             <p className="text-xs text-slate-500 uppercase tracking-widest">Gerado em: {new Date().toLocaleString('pt-BR')}</p>
             <p className="text-xs text-slate-500 uppercase tracking-widest">Total de registros filtrados: {filteredLeads.length}</p>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.01)] p-8 grid grid-cols-1 md:grid-cols-4 gap-6 print:hidden">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Pesquisa Geral</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Nome, e-mail ou interesse..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase text-slate-900 outline-none focus:bg-white focus:border-indigo-200 transition-all"
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Origem do Contato</label>
              <select 
                value={filterOrigem}
                onChange={(e) => setFilterOrigem(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase text-slate-900 outline-none focus:bg-white focus:border-indigo-200 transition-all appearance-none cursor-pointer"
              >
                <option value="">Todas as Origens</option>
                {origensDisponiveis.map(o => (
                  <option key={o} value={o}>{o.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Data Inicial</label>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase text-slate-900 outline-none focus:bg-white transition-all cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Data Final</label>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase text-slate-900 outline-none focus:bg-white transition-all cursor-pointer"
              />
            </div>
          </div>

          {/* Grid de Cards (Mobile & Desktop) */}
          <div className="print:hidden">
            {loading ? (
              <div className="py-32 flex flex-col items-center justify-center text-center space-y-4">
                 <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sincronizando Leads...</p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="py-32 flex flex-col items-center justify-center text-center space-y-4 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
                  <Icons.Users />
                </div>
                <div>
                  <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Nenhum registro localizado</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Refine os filtros de busca</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredLeads.map((lead) => (
                  <div key={lead.id} className="relative bg-white rounded-[2.5rem] border border-slate-100 p-8 flex flex-col h-full transition-all duration-300 ease-out hover:-translate-y-1 hover:border-slate-200 hover:shadow-[0_20px_40px_rgba(15,23,42,0.08)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-slate-200 before:to-transparent before:opacity-0 hover:before:opacity-100 group">
                    {/* Badge de Origem */}
                    <div className="flex justify-between items-start mb-6">
                      <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-400">
                        {lead.origem}
                      </span>
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">
                        {formatDateTime(lead.created_at)}
                      </span>
                    </div>

                    {/* Perfil */}
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm uppercase">
                        {(lead.nome?.[0] || '?')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-black text-slate-950 uppercase tracking-tight truncate">
                          {lead.nome ?? 'Anônimo'}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate mt-0.5">
                          {lead.telefone ?? '—'}
                        </p>
                      </div>
                    </div>

                    {/* Conteúdo de Interesse */}
                    <div className="flex-1 space-y-6">
                      <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                        <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest block mb-2">Interesse Imobiliário</label>
                        <p className="text-[10px] font-black text-slate-700 uppercase leading-relaxed line-clamp-2">
                          {lead.imovel_interesse ?? '—'}
                        </p>
                      </div>
                      
                      {lead.email && (
                        <div className="flex items-center gap-2">
                           <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                           <p className="text-[9px] font-bold text-slate-400 lowercase truncate">{lead.email}</p>
                        </div>
                      )}
                    </div>

                    {/* Ações do Card */}
                    <div className="mt-8 pt-8 border-t border-slate-50 grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => handleWhatsApp(lead)}
                        disabled={!lead.telefone}
                        className="py-3 bg-[#25D366] text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-[#20ba5a] transition-all disabled:opacity-50 active:scale-95"
                      >
                        WhatsApp
                      </button>
                      <button 
                        onClick={() => handleDelete(lead.id)}
                        className="py-3 bg-white border border-slate-200 text-rose-500 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-50 hover:border-rose-100 transition-all active:scale-95"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Versão para Impressão (PDF) */}
          <div className="hidden print:block w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900">
                  <th className="py-4 px-2 text-[10px] font-black uppercase">Data</th>
                  <th className="py-4 px-2 text-[10px] font-black uppercase">Nome</th>
                  <th className="py-4 px-2 text-[10px] font-black uppercase">Contato</th>
                  <th className="py-4 px-2 text-[10px] font-black uppercase">Origem</th>
                  <th className="py-4 px-2 text-[10px] font-black uppercase">Interesse</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((l) => (
                  <tr key={l.id} className="border-b border-slate-100">
                    <td className="py-4 px-2 text-[9px] font-medium uppercase">{new Date(l.created_at).toLocaleDateString('pt-BR')}</td>
                    <td className="py-4 px-2 text-[9px] font-bold uppercase">{l.nome || '—'}</td>
                    <td className="py-4 px-2 text-[9px]">
                      {l.telefone || ''} {l.email ? `(${l.email})` : ''}
                    </td>
                    <td className="py-4 px-2 text-[9px] uppercase font-bold text-slate-400">{l.origem}</td>
                    <td className="py-4 px-2 text-[9px] uppercase">{l.imovel_interesse || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Informativo */}
          <div className="p-8 bg-slate-50/30 border-t border-slate-50 text-center print:hidden">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
              {loading ? 'Calculando métricas...' : `Visualizando ${filteredLeads.length} de ${leads.length} registros no fluxo`}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Leads;
