
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Icons } from '../constants';
import { supabase } from '../services/supabase';
import { Imovel, Caracteristica, Comodidade, NegociacaoOpcao } from '../types';

const ImovelForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Master Data
  const [caracteristicasMaster, setCaracteristicasMaster] = useState<Caracteristica[]>([]);
  const [comodidadesMaster, setComodidadesMaster] = useState<Comodidade[]>([]);
  const [negociacaoMaster, setNegociacaoMaster] = useState<NegociacaoOpcao[]>([]);

  // Form State
  const [formData, setFormData] = useState<Partial<Imovel>>({
    status_imovel: 'Disponível',
    finalidade: 'venda',
    ativo: true,
    destaque: false,
    dormitorios: 0,
    suites: 0,
    banheiros: 0,
    vagas_garagem: 0,
    area_m2: 0,
    tipo_imovel: 'Apartamento'
  });

  const [selectedCaracteristicas, setSelectedCaracteristicas] = useState<string[]>([]);
  const [selectedComodidades, setSelectedComodidades] = useState<string[]>([]);
  const [selectedNegociacao, setSelectedNegociacao] = useState<string[]>([]);
  const [fotos, setFotos] = useState<{ url: string; is_capa: boolean }[]>([]);

  useEffect(() => {
    loadMasterData();
    if (id) loadImovelData();
  }, [id]);

  async function loadMasterData() {
    const [c, com, n] = await Promise.all([
      supabase.from('imoveis_caracteristicas').select('*'),
      supabase.from('imoveis_comodidades').select('*'),
      supabase.from('negociacao_opcoes').select('*')
    ]);
    if (c.data) setCaracteristicasMaster(c.data);
    if (com.data) setComodidadesMaster(com.data);
    if (n.data) setNegociacaoMaster(n.data);
  }

  async function loadImovelData() {
    setFetching(true);
    try {
      const { data, error } = await supabase
        .from('imoveis')
        .select(`
          *,
          imoveis_fotos(*),
          imoveis_caracteristicas_rel(caracteristica_id),
          imoveis_comodidades_rel(comodidade_id),
          imoveis_negociacao_opcoes(negociacao_id)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setFormData(data);
        setFotos(data.imoveis_fotos || []);
        setSelectedCaracteristicas(data.imoveis_caracteristicas_rel.map((r: any) => r.caracteristica_id));
        setSelectedComodidades(data.imoveis_comodidades_rel.map((r: any) => r.comodidade_id));
        setSelectedNegociacao(data.imoveis_negociacao_opcoes.map((r: any) => r.negociacao_id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const imovelToSave = { 
        ...formData, 
        slug: formData.titulo?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-') 
      };
      
      const { data: savedImovel, error } = await supabase
        .from('imoveis')
        .upsert(imovelToSave)
        .select()
        .single();

      if (error) throw error;

      // Handle Relations
      const imovelId = savedImovel.id;
      
      // Clear and re-insert relations (Simplified approach for this example)
      await Promise.all([
        supabase.from('imoveis_caracteristicas_rel').delete().eq('imovel_id', imovelId),
        supabase.from('imoveis_comodidades_rel').delete().eq('imovel_id', imovelId),
        supabase.from('imoveis_negociacao_opcoes').delete().eq('imovel_id', imovelId),
        supabase.from('imoveis_fotos').delete().eq('imovel_id', imovelId)
      ]);

      await Promise.all([
        supabase.from('imoveis_caracteristicas_rel').insert(selectedCaracteristicas.map(cid => ({ imovel_id: imovelId, caracteristica_id: cid }))),
        supabase.from('imoveis_comodidades_rel').insert(selectedComodidades.map(cid => ({ imovel_id: imovelId, comodidade_id: cid }))),
        supabase.from('imoveis_negociacao_opcoes').insert(selectedNegociacao.map(nid => ({ imovel_id: imovelId, negociacao_id: nid }))),
        supabase.from('imoveis_fotos').insert(fotos.map((f, i) => ({ ...f, imovel_id: imovelId, ordem: i })))
      ]);

      navigate('/imoveis');
    } catch (err) {
      alert('Erro ao salvar imóvel');
    } finally {
      setLoading(false);
    }
  }

  const handleToggle = (id: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(id)) setList(list.filter(i => i !== id));
    else setList([...list, id]);
  };

  if (fetching) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center animate-pulse">
        <div className="w-16 h-16 bg-indigo-600 rounded-3xl mx-auto mb-6"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Carregando dados da propriedade...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-['Inter',_sans-serif] antialiased">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <header className="h-20 w-full bg-white/70 backdrop-blur-xl border-b border-slate-100/80 flex items-center px-8 md:px-12 justify-between sticky top-0 z-40">
           <div className="hidden md:flex items-center gap-2 text-slate-300">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:text-indigo-600" onClick={() => navigate('/imoveis')}>Imóveis</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">{id ? 'Editar' : 'Novo'} Imóvel</span>
            </div>
        </header>

        <main className="p-8 md:p-12 max-w-[1400px] mx-auto w-full space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-2">
              <h2 className="text-4xl md:text-5xl font-black text-slate-950 uppercase tracking-tighter leading-[0.85]">
                {id ? 'Editar' : 'Nova'} <span className="text-slate-300">Propriedade</span>
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/imoveis')} className="px-6 py-4 bg-white border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl">Cancelar</button>
              <button form="imovel-form" disabled={loading} className="px-10 py-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-3">
                {loading ? 'Salvando...' : 'Salvar Imóvel'}
              </button>
            </div>
          </div>

          <form id="imovel-form" onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-10 pb-20">
            <div className="xl:col-span-8 space-y-10">
              {/* 1. Identificação */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-8">
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">1. Identificação e Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Referência</label>
                    <input type="text" value={formData.referencia || ''} onChange={e => setFormData({...formData, referencia: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Cód. Sistema*</label>
                    <input required type="text" value={formData.codigo_imovel || ''} onChange={e => setFormData({...formData, codigo_imovel: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                    <select value={formData.status_imovel} onChange={e => setFormData({...formData, status_imovel: e.target.value as any})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold">
                      <option>Disponível</option>
                      <option>Reservado</option>
                      <option>Vendido</option>
                      <option>Suspenso</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Finalidade*</label>
                    <select value={formData.finalidade} onChange={e => setFormData({...formData, finalidade: e.target.value as any})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold">
                      <option value="venda">Venda</option>
                      <option value="locacao">Locação</option>
                      <option value="venda_locacao">Venda e Locação</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* 2. Dados da Propriedade */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-8">
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">2. Dados da Propriedade</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Título do Anúncio*</label>
                    <input required type="text" value={formData.titulo || ''} onChange={e => setFormData({...formData, titulo: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Imóvel</label>
                      <input type="text" value={formData.tipo_imovel || ''} onChange={e => setFormData({...formData, tipo_imovel: e.target.value})} placeholder="Apartamento..." className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Área m²</label>
                      <input type="number" value={formData.area_m2 || 0} onChange={e => setFormData({...formData, area_m2: Number(e.target.value)})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Venda R$</label>
                      <input type="number" value={formData.valor_venda || ''} onChange={e => setFormData({...formData, valor_venda: Number(e.target.value)})} className="w-full px-5 py-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-black text-indigo-600" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Locação R$</label>
                      <input type="number" value={formData.valor_locacao || ''} onChange={e => setFormData({...formData, valor_locacao: Number(e.target.value)})} className="w-full px-5 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-black text-emerald-600" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    {['dormitorios', 'suites', 'banheiros', 'vagas_garagem'].map(field => (
                      <div key={field} className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{field.replace('_', ' ')}</label>
                        <input type="number" value={(formData as any)[field] || 0} onChange={e => setFormData({...formData, [field]: Number(e.target.value)})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-center" />
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* 3. Localização */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-8">
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">3. Localização</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Bairro*</label>
                    <input required type="text" value={formData.bairro || ''} onChange={e => setFormData({...formData, bairro: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Cidade*</label>
                    <input required type="text" value={formData.cidade || ''} onChange={e => setFormData({...formData, cidade: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">UF*</label>
                    <input required type="text" maxLength={2} value={formData.uf || ''} onChange={e => setFormData({...formData, uf: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-center" />
                  </div>
                </div>
              </section>

              {/* 7 & 8: Features e Negociação */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Características</h3>
                  <div className="flex flex-wrap gap-2">
                    {caracteristicasMaster.map(c => (
                      <button key={c.id} type="button" onClick={() => handleToggle(c.id, selectedCaracteristicas, setSelectedCaracteristicas)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${selectedCaracteristicas.includes(c.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>{c.nome}</button>
                    ))}
                  </div>
                </section>
                <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Negociação</h3>
                  <div className="flex flex-wrap gap-2">
                    {negociacaoMaster.map(n => (
                      <button key={n.id} type="button" onClick={() => handleToggle(n.id, selectedNegociacao, setSelectedNegociacao)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${selectedNegociacao.includes(n.id) ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>{n.nome}</button>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            <div className="xl:col-span-4 space-y-10">
              {/* Marketing & Status */}
              <section className="bg-slate-950 rounded-[3rem] p-10 text-white space-y-8">
                 <h3 className="text-[11px] font-black uppercase tracking-[0.3em]">Configurações</h3>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => setFormData({...formData, ativo: !formData.ativo})}>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-tight">Publicar Imóvel</p>
                        <p className="text-[9px] text-white/40 font-bold uppercase">Visível para clientes</p>
                      </div>
                      <div className={`w-12 h-6 rounded-full relative transition-all ${formData.ativo ? 'bg-indigo-600' : 'bg-white/10'}`}>
                         <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.ativo ? 'right-1' : 'left-1'}`}></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => setFormData({...formData, destaque: !formData.destaque})}>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-tight">⭐ Destaque Premium</p>
                        <p className="text-[9px] text-white/40 font-bold uppercase">Topo da vitrine</p>
                      </div>
                      <div className={`w-12 h-6 rounded-full relative transition-all ${formData.destaque ? 'bg-amber-500' : 'bg-white/10'}`}>
                         <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.destaque ? 'right-1' : 'left-1'}`}></div>
                      </div>
                    </div>
                 </div>
              </section>

              {/* Galeria */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 space-y-6 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Galeria de Fotos (até 15)</h3>
                <div className="grid grid-cols-3 gap-2">
                   {fotos.map((f, i) => (
                     <div key={i} className={`aspect-square bg-slate-100 rounded-xl relative overflow-hidden group border-2 ${f.is_capa ? 'border-indigo-600' : 'border-transparent'}`}>
                        <img src={f.url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                           <button type="button" onClick={() => setFotos(fotos.filter((_, idx) => idx !== i))} className="text-white text-[8px] font-black uppercase">Excluir</button>
                           <button type="button" onClick={() => setFotos(fotos.map((item, idx) => ({ ...item, is_capa: idx === i })))} className="text-white text-[8px] font-black uppercase">Capa</button>
                        </div>
                     </div>
                   ))}
                   {fotos.length < 15 && (
                     <div 
                      onClick={() => {
                        const url = prompt('URL da Imagem:');
                        if (url) setFotos([...fotos, { url, is_capa: fotos.length === 0 }]);
                      }}
                      className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-300 cursor-pointer hover:border-indigo-400 hover:text-indigo-400 transition-all"
                     >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
                     </div>
                   )}
                </div>
              </section>

              {/* Descrição */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 space-y-4 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Marketing / Descrição</h3>
                <textarea rows={10} value={formData.descricao || ''} onChange={e => setFormData({...formData, descricao: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-medium text-slate-600 outline-none focus:bg-white transition-all resize-none" placeholder="Texto para o site..." />
              </section>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default ImovelForm;
