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

// Domínio fixo do Worker orange conforme solicitado
const WORKER_URL = 'https://orange.corretorprime36.workers.dev';

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
        codigo_imovel: `IMV-${Math.floor(1000 + Math.random() * 9000)}`
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
        // HIDRATAÇÃO SEGURA: Impede que 'null' do banco quebre os arrays do frontend
        setFormData({
          ...INITIAL_FORM_STATE,
          ...data,
          caracteristicas_imovel: data.caracteristicas_imovel || [],
          caracteristicas_condominio: data.caracteristicas_condominio || [],
          opcoes_negociacao: data.opcoes_negociacao || [],
          valor_venda: data.valor_venda || 0,
          valor_locacao: data.valor_locacao || 0
        });

        const existingPhotos = (data.imoveis_fotos || [])
          .sort((a: any, b: any) => a.ordem - b.ordem)
          .map((img: any) => ({
            id: img.id,
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

      // 1. Persistir Imóvel
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

      // 2. Upload para Worker R2 (com correção de CORS no preflight implícito)
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

        if (!response.ok) throw new Error(`Upload falhou: ${response.statusText}`);
        
        // O Worker deve retornar a URL final no JSON
        const data = await response.json();
        return { url: data.url || `${WORKER_URL}/${fileName}`, ordem: idx };
      }));

      // 3. Atualizar Tabela de Fotos
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

      alert('Imóvel salvo com sucesso!');
      navigate('/imoveis');
    } catch (err: any) {
      alert(`Erro ao salvar: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Sincronizando Dados...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-['Inter',_sans-serif]">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        
        <header className="h-20 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center px-8 md:px-12 justify-between sticky top-0 z-40">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 leading-none">Admin Panel</span>
            <h1 className="text-sm font-black uppercase text-slate-900 mt-1">{id ? 'Editar Propriedade' : 'Nova Propriedade'}</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/imoveis')} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all">Cancelar</button>
            <button form="imovel-form" disabled={loading} className="px-8 py-2.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50">
              {loading ? 'Processando...' : 'Salvar Alterações'}
            </button>
          </div>
        </header>

        <main className="p-8 md:p-12 max-w-[1400px] mx-auto w-full">
          <form id="imovel-form" onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-10">
            
            <div className="xl:col-span-8 space-y-10">
              
              {/* 1. Identificação */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-10 space-y-8 shadow-sm">
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-8 h-8 bg-slate-950 text-white rounded-lg flex items-center justify-center text-[10px]">01</span>
                  Identificação e Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Ref. Interna</label>
                    <input value={formData.referencia || ''} onChange={e => setFormData({...formData, referencia: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:bg-white focus:border-indigo-200 outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Código Sistema</label>
                    <input readOnly value={formData.codigo_imovel || ''} className="w-full px-5 py-3.5 bg-slate-100 border border-slate-100 rounded-2xl text-xs font-black text-slate-400" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                    <select value={formData.status_imovel} onChange={e => setFormData({...formData, status_imovel: e.target.value as any})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none">
                      <option value="Disponível">Disponível</option>
                      <option value="Vendido">Vendido</option>
                      <option value="Alugado">Alugado</option>
                      <option value="Suspenso">Suspenso</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Finalidade</label>
                    <select value={formData.finalidade} onChange={e => setFormData({...formData, finalidade: e.target.value as any})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none">
                      <option value="venda">Venda</option>
                      <option value="locacao">Aluguel</option>
                      <option value="venda_locacao">Ambos</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* 2. Dados da Propriedade */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-10 space-y-8 shadow-sm">
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-8 h-8 bg-slate-950 text-white rounded-lg flex items-center justify-center text-[10px]">02</span>
                  Dados da Propriedade
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Título do Anúncio</label>
                    <input required value={formData.titulo || ''} onChange={e => setFormData({...formData, titulo: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:bg-white focus:border-indigo-200 outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo do Imóvel</label>
                    <select value={formData.tipo_imovel} onChange={e => setFormData({...formData, tipo_imovel: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none">
                      <option>Apartamento</option>
                      <option>Casa</option>
                      <option>Cobertura</option>
                      <option>Terreno</option>
                      <option>Comercial</option>
                      <option>Flat</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor do Imóvel (R$)</label>
                    <input type="number" value={formData.finalidade === 'locacao' ? formData.valor_locacao : formData.valor_venda} onChange={e => setFormData({...formData, [formData.finalidade === 'locacao' ? 'valor_locacao' : 'valor_venda']: Number(e.target.value)})} className="w-full px-5 py-3.5 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs font-black text-indigo-600 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                   {[
                    { label: 'Área (m²)', key: 'area_m2' },
                    { label: 'Dorms', key: 'dormitorios' },
                    { label: 'Suítes', key: 'suites' },
                    { label: 'Banhs', key: 'banheiros' },
                    { label: 'Vagas', key: 'vagas_garagem' }
                   ].map(item => (
                    <div key={item.key} className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{item.label}</label>
                      <input type="number" value={(formData as any)[item.key] || 0} onChange={e => setFormData({...formData, [item.key]: Number(e.target.value)})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none" />
                    </div>
                   ))}
                </div>
              </section>

              {/* 3. Localização */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-10 space-y-8 shadow-sm">
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-8 h-8 bg-slate-950 text-white rounded-lg flex items-center justify-center text-[10px]">03</span>
                  Localização
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Bairro</label>
                    <input value={formData.bairro || ''} onChange={e => setFormData({...formData, bairro: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Cidade</label>
                    <input value={formData.cidade || ''} onChange={e => setFormData({...formData, cidade: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">UF</label>
                    <input maxLength={2} value={formData.uf || ''} onChange={e => setFormData({...formData, uf: e.target.value.toUpperCase()})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none" />
                  </div>
                </div>
              </section>

              {/* 4. Características do Imóvel */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-10 space-y-8 shadow-sm">
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-8 h-8 bg-slate-950 text-white rounded-lg flex items-center justify-center text-[10px]">04</span>
                  Características da Unidade
                </h3>
                <div className="flex flex-wrap gap-2">
                  {LISTA_CARACTERISTICAS_IMOVEL.map(item => (
                    <button 
                      key={item} 
                      type="button"
                      onClick={() => toggleChip('caracteristicas_imovel', item)}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all border ${
                        formData.caracteristicas_imovel?.includes(item) 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                        : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </section>

              {/* 5. Características do Condomínio (RESTAURADO) */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-10 space-y-8 shadow-sm">
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-8 h-8 bg-slate-950 text-white rounded-lg flex items-center justify-center text-[10px]">05</span>
                  Lazer e Condomínio
                </h3>
                <div className="flex flex-wrap gap-2">
                  {LISTA_CARACTERISTICAS_CONDOMINIO.map(item => (
                    <button 
                      key={item} 
                      type="button"
                      onClick={() => toggleChip('caracteristicas_condominio', item)}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all border ${
                        formData.caracteristicas_condominio?.includes(item) 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                        : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </section>

              {/* 6. Negociação e Garantias (RESTAURADO) */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-10 space-y-10 shadow-sm">
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-8 h-8 bg-slate-950 text-white rounded-lg flex items-center justify-center text-[10px]">06</span>
                  Condições de Negócio
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-2">Opções de Pagamento</h4>
                    <div className="flex flex-wrap gap-2">
                      {LISTA_PAGAMENTO.map(item => (
                        <button 
                          key={item} 
                          type="button"
                          onClick={() => toggleChip('opcoes_negociacao', item)}
                          className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all border ${
                            formData.opcoes_negociacao?.includes(item) 
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                            : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-2">Garantias (Locação)</h4>
                    <div className="flex flex-wrap gap-2">
                      {LISTA_GARANTIAS.map(item => (
                        <button 
                          key={item} 
                          type="button"
                          onClick={() => toggleChip('opcoes_negociacao', item)}
                          className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all border ${
                            formData.opcoes_negociacao?.includes(item) 
                            ? 'bg-amber-600 text-white border-amber-600 shadow-sm' 
                            : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'
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

            {/* Sidebar Galeria & Marketing */}
            <div className="xl:col-span-4 space-y-10">
              
              {/* Galeria de Fotos */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-8 flex flex-col min-h-[500px]">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Galeria (Até 15)</h3>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                    <Icons.Plus />
                  </button>
                  <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelection} />
                </div>

                <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-[650px] pr-2 custom-scrollbar">
                  {photos.map((photo, idx) => (
                    <div 
                      key={photo.id}
                      draggable
                      onDragStart={() => onDragStart(idx)}
                      onDragOver={(e) => onDragOver(e, idx)}
                      onDragEnd={() => setDraggedIndex(null)}
                      className={`relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border group cursor-move shadow-sm transition-all hover:scale-[1.02] ${idx === 0 ? 'border-indigo-400 ring-2 ring-indigo-50' : 'border-slate-100'}`}
                    >
                      <img src={photo.preview} className="w-full h-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                        <div className="flex gap-2">
                           {idx > 0 && (
                             <button type="button" onClick={() => reorderPhotos(idx, idx - 1)} className="p-2 bg-white text-slate-900 rounded-lg shadow-lg">
                               <Icons.ArrowUp />
                             </button>
                           )}
                           {idx < photos.length - 1 && (
                             <button type="button" onClick={() => reorderPhotos(idx, idx + 1)} className="p-2 bg-white text-slate-900 rounded-lg shadow-lg">
                               <Icons.ArrowDown />
                             </button>
                           )}
                        </div>
                        <button type="button" onClick={() => removePhoto(idx)} className="p-2 bg-rose-500 text-white rounded-xl shadow-lg hover:bg-rose-600">
                          <Icons.Trash />
                        </button>
                      </div>
                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[8px] font-black text-slate-900 uppercase shadow-sm">
                        {idx === 0 ? 'CAPA' : `#${idx + 1}`}
                      </div>
                    </div>
                  ))}
                  {photos.length === 0 && (
                    <div className="col-span-2 py-24 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-300">
                      <Icons.Building />
                      <p className="text-[9px] font-black uppercase mt-4 tracking-widest">Aguardando Fotos</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Configurações de Publicação */}
              <section className="bg-slate-950 rounded-[2.5rem] p-8 text-white space-y-8 shadow-2xl">
                 <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Marketing & Visibilidade</h3>
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-black uppercase tracking-widest block">Publicado</span>
                          <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Visível no catálogo principal</span>
                        </div>
                        <div onClick={() => setFormData({...formData, ativo: !formData.ativo})} className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-500 ${formData.ativo ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-white/10'}`}>
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-500 ${formData.ativo ? 'right-1' : 'left-1'}`}></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-black uppercase tracking-widest block">Destaque Premium</span>
                          <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Exibir no topo da página inicial</span>
                        </div>
                        <div onClick={() => setFormData({...formData, destaque: !formData.destaque})} className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-500 ${formData.destaque ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-white/10'}`}>
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-500 ${formData.destaque ? 'right-1' : 'left-1'}`}></div>
                        </div>
                      </div>
                    </div>
                 </div>
                 
                 <div className="pt-8 border-t border-white/10 space-y-4">
                    <div className="flex items-center gap-2">
                      <Icons.Settings />
                      <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50 block">Descrição Comercial</label>
                    </div>
                    <textarea rows={8} value={formData.descricao || ''} onChange={e => setFormData({...formData, descricao: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-xs font-medium outline-none focus:border-indigo-500/50 transition-all resize-none leading-relaxed placeholder:text-white/10" placeholder="Descreva os diferenciais únicos desta propriedade..." />
                 </div>
              </section>

            </div>
          </form>
        </main>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
      `}</style>
    </div>
  );
};

export default ImovelForm;