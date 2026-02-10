import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Icons, LISTA_CARACTERISTICAS_IMOVEL, LISTA_CARACTERISTICAS_CONDOMINIO, LISTA_PAGAMENTO, LISTA_GARANTIAS } from '../constants';
import { supabase } from '../services/supabase';
import { Imovel } from '../types';

interface PhotoItem {
  id: string;
  file: File | null;
  preview: string;
  url?: string;
  isNew: boolean;
}

const INITIAL_FORM_STATE: Partial<Imovel> = {
  referencia: '',
  codigo_imovel: '',
  status_imovel: 'Disponível',
  finalidade: 'venda',
  titulo: '',
  tipo_imovel: 'Apartamento',
  valor_venda: 0,
  valor_locacao: 0,
  area_m2: 0,
  dormitorios: 0,
  suites: 0,
  banheiros: 0,
  vagas_garagem: 0,
  bairro: '',
  cidade: '',
  uf: '',
  descricao: '',
  destaque: false,
  ativo: true,
  caracteristicas_imovel: [],
  caracteristicas_condominio: [],
  opcoes_negociacao: []
};

const WORKER_URL = 'https://orange.corretorprime36.workers.dev';

const generateUniqueCode = () => {
  const now = new Date();
  const datePart = now.toISOString().slice(2, 10).replace(/-/g, '');
  const timePart = now.getTime().toString().slice(-4);
  const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `IMV-${datePart}${timePart}${randomPart}`;
};

const ImovelForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState<Partial<Imovel>>(INITIAL_FORM_STATE);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      fetchImovel();
    } else {
      setFormData({
        ...INITIAL_FORM_STATE,
        codigo_imovel: generateUniqueCode()
      });
    }
  }, [id]);

  const fetchImovel = async () => {
    setFetching(true);
    try {
      const { data, error } = await supabase
        .from('imoveis')
        .select('*, imoveis_fotos!imoveis_fotos_imovel_id_fkey(*)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        // HIDRATAÇÃO PROFUNDA: Garante que mesmo campos NULL no banco virem arrays vazios no front
        const hydratedData = {
          ...INITIAL_FORM_STATE,
          ...data,
          caracteristicas_imovel: data.caracteristicas_imovel || [],
          caracteristicas_condominio: data.caracteristicas_condominio || [],
          opcoes_negociacao: data.opcoes_negociacao || [],
          valor_venda: data.valor_venda || 0,
          valor_locacao: data.valor_locacao || 0
        };
        setFormData(hydratedData);

        const existingPhotos = (data.imoveis_fotos || [])
          .sort((a: any, b: any) => a.ordem - b.ordem)
          .map((img: any) => ({
            id: img.id || Math.random().toString(36).substr(2, 9),
            file: null,
            preview: img.url,
            url: img.url,
            isNew: false
          }));
        setPhotos(existingPhotos);
      }
    } catch (err) {
      console.error('Erro ao carregar imóvel:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file),
        isNew: true
      }));
      setPhotos(prev => [...prev, ...newFiles].slice(0, 15));
    }
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => {
      const item = prev[index];
      if (item.isNew) URL.revokeObjectURL(item.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const reorderPhotos = (from: number, to: number) => {
    if (to < 0 || to >= photos.length) return;
    const newPhotos = [...photos];
    const [movedItem] = newPhotos.splice(from, 1);
    newPhotos.splice(to, 0, movedItem);
    setPhotos(newPhotos);
  };

  const toggleChip = (list: keyof Imovel, value: string) => {
    const current = (formData[list] as string[]) || [];
    const next = current.includes(value) 
      ? current.filter(item => item !== value) 
      : [...current, value];
    setFormData({ ...formData, [list]: next });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const slug = formData.titulo?.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

      // 1. Persistir Imóvel (Supabase)
      const { data: savedImovel, error: imovelError } = await supabase
        .from('imoveis')
        .upsert({ 
          ...formData, 
          slug,
          imoveis_fotos: undefined 
        } as any)
        .select()
        .single();

      if (imovelError) throw imovelError;

      // 2. Upload para Worker orange (R2)
      const finalPhotos = await Promise.all(photos.map(async (p, idx) => {
        if (!p.isNew) return { url: p.url!, ordem: idx };

        const ext = p.file!.name.split('.').pop() || 'jpg';
        const fileName = `${savedImovel.id}/${Date.now()}-${idx}.${ext}`;
        
        const response = await fetch(`${WORKER_URL}/${fileName}`, {
          method: 'PUT',
          body: p.file,
          headers: { 
            'Content-Type': p.file!.type,
          }
        });

        if (!response.ok) throw new Error(`Erro R2 (${response.status}): Tente novamente`);
        
        const resData = await response.json();
        // Garante que usamos a URL absoluta retornada ou construímos a correta
        const finalUrl = resData.url || `${WORKER_URL}/${fileName}`;
        return { url: finalUrl, ordem: idx };
      }));

      // 3. Sincronizar Galeria no Banco
      await supabase.from('imoveis_fotos').delete().eq('imovel_id', savedImovel.id);
      
      const { error: photosError } = await supabase.from('imoveis_fotos').insert(
        finalPhotos.map((p, idx) => ({
          imovel_id: savedImovel.id,
          url: p.url,
          ordem: idx,
          is_capa: idx === 0
        }))
      );

      if (photosError) throw photosError;

      alert('Propriedade salva com sucesso!');
      navigate('/imoveis');
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-2xl shadow-indigo-100"></div>
        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">Sincronizando Banco de Dados</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-['Inter',_sans-serif] antialiased">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        
        <header className="h-24 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100/60 flex items-center px-8 md:px-12 justify-between sticky top-0 z-40">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 mb-1">Inventário Global</span>
            <h1 className="text-base font-black uppercase text-slate-900 tracking-tight">{id ? `Editando: ${formData.codigo_imovel}` : 'Novo Cadastro Premium'}</h1>
          </div>
          <div className="flex gap-4">
            <button type="button" onClick={() => navigate('/imoveis')} className="px-7 py-3 bg-white border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95">Descartar</button>
            <button form="imovel-form" disabled={loading} className="px-10 py-3 bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3">
              {loading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Icons.Plus />}
              {loading ? 'Sincronizando...' : 'Publicar Alterações'}
            </button>
          </div>
        </header>

        <main className="p-8 md:p-12 max-w-[1500px] mx-auto w-full">
          <form id="imovel-form" onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-12">
            
            <div className="xl:col-span-8 space-y-12">
              
              {/* BLOCO 01: STATUS */}
              <section className="bg-white rounded-[3rem] border border-slate-100/80 p-10 space-y-10 shadow-sm">
                <div className="flex items-center gap-4">
                  <span className="w-10 h-10 bg-slate-950 text-white rounded-2xl flex items-center justify-center font-black text-xs">01</span>
                  <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.3em]">Identificação Estratégica</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Ref. Interna (Opcional)</label>
                    <input value={formData.referencia || ''} onChange={e => setFormData({...formData, referencia: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:bg-white focus:border-indigo-200 outline-none transition-all" placeholder="Ex: COB-01" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Código Único (Automático)</label>
                    <input readOnly value={formData.codigo_imovel || ''} className="w-full px-6 py-4 bg-slate-100 border border-slate-100 rounded-2xl text-xs font-black text-slate-400 cursor-not-allowed" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Status de Mercado</label>
                    <select value={formData.status_imovel} onChange={e => setFormData({...formData, status_imovel: e.target.value as any})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none hover:border-indigo-100">
                      <option value="Disponível">Disponível</option>
                      <option value="Vendido">Vendido</option>
                      <option value="Alugado">Alugado</option>
                      <option value="Suspenso">Suspenso</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Finalidade Comercial</label>
                    <select value={formData.finalidade} onChange={e => setFormData({...formData, finalidade: e.target.value as any})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none">
                      <option value="venda">Apenas Venda</option>
                      <option value="locacao">Apenas Aluguel</option>
                      <option value="venda_locacao">Venda e Aluguel</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* BLOCO 02: DADOS TÉCNICOS */}
              <section className="bg-white rounded-[3rem] border border-slate-100/80 p-10 space-y-10 shadow-sm">
                <div className="flex items-center gap-4">
                  <span className="w-10 h-10 bg-slate-950 text-white rounded-2xl flex items-center justify-center font-black text-xs">02</span>
                  <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.3em]">Ficha Técnica da Propriedade</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Título do Anúncio (SEO Friendly)</label>
                    <input required value={formData.titulo || ''} onChange={e => setFormData({...formData, titulo: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:bg-white focus:border-indigo-200 outline-none transition-all" placeholder="Ex: Cobertura Triplex com Vista 360..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipologia</label>
                    <select value={formData.tipo_imovel} onChange={e => setFormData({...formData, tipo_imovel: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none">
                      <option>Apartamento</option>
                      <option>Casa de Condomínio</option>
                      <option>Casa de Rua</option>
                      <option>Cobertura</option>
                      <option>Terreno</option>
                      <option>Comercial</option>
                      <option>Flat / Loft</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Investimento Principal (R$)</label>
                    <input type="number" value={formData.finalidade === 'locacao' ? formData.valor_locacao : formData.valor_venda} onChange={e => setFormData({...formData, [formData.finalidade === 'locacao' ? 'valor_locacao' : 'valor_venda']: Number(e.target.value)})} className="w-full px-6 py-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs font-black text-indigo-600 outline-none focus:ring-4 focus:ring-indigo-100/50 transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 pt-4">
                   {[
                    { label: 'Área Priv.', key: 'area_m2' },
                    { label: 'Dormitórios', key: 'dormitorios' },
                    { label: 'Suítes Priv.', key: 'suites' },
                    { label: 'Banheiros', key: 'banheiros' },
                    { label: 'Vagas Gar.', key: 'vagas_garagem' }
                   ].map(item => (
                    <div key={item.key} className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{item.label}</label>
                      <input type="number" value={(formData as any)[item.key] || 0} onChange={e => setFormData({...formData, [item.key]: Number(e.target.value)})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none hover:bg-white transition-all" />
                    </div>
                   ))}
                </div>
              </section>

              {/* BLOCO 03: LOCALIZAÇÃO */}
              <section className="bg-white rounded-[3rem] border border-slate-100/80 p-10 space-y-10 shadow-sm">
                <div className="flex items-center gap-4">
                  <span className="w-10 h-10 bg-slate-950 text-white rounded-2xl flex items-center justify-center font-black text-xs">03</span>
                  <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.3em]">Geolocalização</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Bairro / Distrito</label>
                    <input value={formData.bairro || ''} onChange={e => setFormData({...formData, bairro: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Cidade / Município</label>
                    <input value={formData.cidade || ''} onChange={e => setFormData({...formData, cidade: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado (UF)</label>
                    <input maxLength={2} value={formData.uf || ''} onChange={e => setFormData({...formData, uf: e.target.value.toUpperCase()})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-900 outline-none text-center" />
                  </div>
                </div>
              </section>

              {/* BLOCO 04: DIFERENCIAIS UNIDADE */}
              <section className="bg-white rounded-[3rem] border border-slate-100/80 p-10 space-y-10 shadow-sm">
                <div className="flex items-center gap-4">
                  <span className="w-10 h-10 bg-slate-950 text-white rounded-2xl flex items-center justify-center font-black text-xs">04</span>
                  <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.3em]">Diferenciais da Unidade</h3>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {LISTA_CARACTERISTICAS_IMOVEL.map(item => (
                    <button 
                      key={item} 
                      type="button"
                      onClick={() => toggleChip('caracteristicas_imovel', item)}
                      className={`px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                        formData.caracteristicas_imovel?.includes(item) 
                        ? 'bg-slate-950 text-white border-slate-950 shadow-xl' 
                        : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100 hover:text-slate-600'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </section>

              {/* BLOCO 05: CONDOMÍNIO (RESTAURADO E GARANTIDO) */}
              <section className="bg-white rounded-[3rem] border border-slate-100/80 p-10 space-y-10 shadow-sm">
                <div className="flex items-center gap-4">
                  <span className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-xs">05</span>
                  <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.3em]">Lazer e Condomínio</h3>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {LISTA_CARACTERISTICAS_CONDOMINIO.map(item => (
                    <button 
                      key={item} 
                      type="button"
                      onClick={() => toggleChip('caracteristicas_condominio', item)}
                      className={`px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                        formData.caracteristicas_condominio?.includes(item) 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100' 
                        : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100 hover:text-slate-600'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </section>

              {/* BLOCO 06: NEGOCIAÇÃO (RESTAURADO E GARANTIDO) */}
              <section className="bg-white rounded-[3rem] border border-slate-100/80 p-10 space-y-12 shadow-sm">
                <div className="flex items-center gap-4">
                  <span className="w-10 h-10 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-black text-xs">06</span>
                  <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.3em]">Condições de Negociação</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  {/* Pagamento */}
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-950 uppercase tracking-[0.4em] border-b border-slate-50 pb-3 flex items-center gap-2">
                       <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                       Facilidades de Pagamento
                    </h4>
                    <div className="flex flex-wrap gap-2.5">
                      {LISTA_PAGAMENTO.map(item => (
                        <button 
                          key={item} 
                          type="button"
                          onClick={() => toggleChip('opcoes_negociacao', item)}
                          className={`px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                            formData.opcoes_negociacao?.includes(item) 
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-50' 
                            : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100 hover:text-slate-600'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Garantias */}
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-950 uppercase tracking-[0.4em] border-b border-slate-50 pb-3 flex items-center gap-2">
                       <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                       Garantias de Locação
                    </h4>
                    <div className="flex flex-wrap gap-2.5">
                      {LISTA_GARANTIAS.map(item => (
                        <button 
                          key={item} 
                          type="button"
                          onClick={() => toggleChip('opcoes_negociacao', item)}
                          className={`px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                            formData.opcoes_negociacao?.includes(item) 
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xl shadow-amber-50' 
                            : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100 hover:text-slate-600'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* SIDEBAR GALERIA */}
            <div className="xl:col-span-4 space-y-12">
              
              <section className="bg-white rounded-[3rem] border border-slate-100/80 p-8 shadow-sm space-y-8 flex flex-col min-h-[600px]">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Galeria Visual</h3>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Limite: 15 imagens</span>
                  </div>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all hover:-translate-y-0.5 active:scale-95">
                    <Icons.Plus />
                  </button>
                  <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelection} />
                </div>

                <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-[750px] pr-2 custom-scrollbar">
                  {photos.map((photo, idx) => (
                    <div 
                      key={photo.id}
                      draggable
                      onDragStart={() => setDraggedIndex(idx)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (draggedIndex === null || draggedIndex === idx) return;
                        reorderPhotos(draggedIndex, idx);
                        setDraggedIndex(idx);
                      }}
                      onDragEnd={() => setDraggedIndex(null)}
                      className={`relative aspect-square rounded-[2rem] overflow-hidden bg-slate-50 border group cursor-move shadow-sm transition-all hover:scale-[1.03] ${idx === 0 ? 'border-indigo-400 ring-4 ring-indigo-50/50' : 'border-slate-100'}`}
                    >
                      <img src={photo.preview} className="w-full h-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                        <div className="flex gap-2">
                           {idx > 0 && (
                             <button type="button" onClick={() => reorderPhotos(idx, idx - 1)} className="p-2.5 bg-white text-slate-900 rounded-xl shadow-lg hover:bg-indigo-50">
                               <Icons.ArrowUp />
                             </button>
                           )}
                           {idx < photos.length - 1 && (
                             <button type="button" onClick={() => reorderPhotos(idx, idx + 1)} className="p-2.5 bg-white text-slate-900 rounded-xl shadow-lg hover:bg-indigo-50">
                               <Icons.ArrowDown />
                             </button>
                           )}
                        </div>
                        <button type="button" onClick={() => removePhoto(idx)} className="p-3 bg-rose-500 text-white rounded-2xl shadow-xl hover:bg-rose-600 hover:scale-110 transition-all">
                          <Icons.Trash />
                        </button>
                      </div>
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-[8px] font-black text-slate-900 uppercase shadow-xl tracking-widest border border-slate-100">
                        {idx === 0 ? '✨ CAPA' : `#${idx + 1}`}
                      </div>
                    </div>
                  ))}
                  {photos.length === 0 && (
                    <div className="col-span-2 py-32 border-2 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center text-slate-300 bg-slate-50/30">
                      <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-inner mb-4">
                        <Icons.Building />
                      </div>
                      <p className="text-[9px] font-black uppercase mt-2 tracking-[0.3em]">Arraste as imagens aqui</p>
                    </div>
                  )}
                </div>
              </section>

              {/* MARKETING SETTINGS */}
              <section className="bg-slate-950 rounded-[3rem] p-10 text-white space-y-10 shadow-2xl shadow-indigo-900/10">
                 <div className="space-y-8">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-indigo-400">Marketing de Exposição</h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between group">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-widest block group-hover:text-indigo-200 transition-colors">Visibilidade Ativa</span>
                          <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Publicar no catálogo público</span>
                        </div>
                        <div onClick={() => setFormData({...formData, ativo: !formData.ativo})} className={`w-14 h-7 rounded-full relative cursor-pointer transition-all duration-500 ${formData.ativo ? 'bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.5)]' : 'bg-white/10'}`}>
                          <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-500 ${formData.ativo ? 'right-1' : 'left-1'}`}></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between group">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-widest block group-hover:text-amber-200 transition-colors">Destaque Premium</span>
                          <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Exibição prioritária na Home</span>
                        </div>
                        <div onClick={() => setFormData({...formData, destaque: !formData.destaque})} className={`w-14 h-7 rounded-full relative cursor-pointer transition-all duration-500 ${formData.destaque ? 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]' : 'bg-white/10'}`}>
                          <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-500 ${formData.destaque ? 'right-1' : 'left-1'}`}></div>
                        </div>
                      </div>
                    </div>
                 </div>
                 
                 <div className="pt-10 border-t border-white/5 space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/5 rounded-xl flex items-center justify-center text-indigo-400">
                        <Icons.Settings />
                      </div>
                      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 block">Descrição Comercial de Impacto</label>
                    </div>
                    <textarea rows={10} value={formData.descricao || ''} onChange={e => setFormData({...formData, descricao: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-8 text-xs font-medium outline-none focus:border-indigo-500/50 transition-all resize-none leading-relaxed custom-scrollbar placeholder:text-white/5" placeholder="Destaque os principais diferenciais desta residência para o futuro comprador..." />
                 </div>
              </section>

            </div>
          </form>
        </main>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        form { animation: fade-in 0.8s ease-out; }
      `}</style>
    </div>
  );
};

export default ImovelForm;