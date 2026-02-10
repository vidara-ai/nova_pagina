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

const WORKER_URL = (import.meta as any).env.VITE_WORKER_URL || 'https://orange.corretorprime36.workers.dev';

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
        // SAFE HYDRATION: Ensure no nulls overwrite initial structure
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
      console.error('Fetch Error:', err);
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

  const onDragStart = (index: number) => setDraggedIndex(index);
  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newPhotos = [...photos];
    const item = newPhotos.splice(draggedIndex, 1)[0];
    newPhotos.splice(index, 0, item);
    setDraggedIndex(index);
    setPhotos(newPhotos);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Upsert Property
      const slug = formData.titulo?.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

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

      // 2. Upload NEW photos to R2 via Worker
      const finalPhotos = await Promise.all(photos.map(async (p, idx) => {
        if (!p.isNew) return { url: p.url!, ordem: idx };

        const ext = p.file!.name.split('.').pop();
        const fileName = `prop_${savedImovel.id}_${Date.now()}_${idx}.${ext}`;
        
        const response = await fetch(`${WORKER_URL}/${fileName}`, {
          method: 'PUT',
          body: p.file,
          headers: { 'Content-Type': p.file!.type }
        });

        if (!response.ok) throw new Error('Worker upload failed');
        const { url } = await response.json();
        return { url, ordem: idx };
      }));

      // 3. Sincronizar Galeria (Delete and Re-insert for order safety)
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

      alert('Sucesso!');
      navigate('/imoveis');
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-20 text-center font-black animate-pulse">CARREGANDO...</div>;

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        
        <header className="h-20 w-full bg-white/70 backdrop-blur-xl border-b border-slate-100 flex items-center px-12 justify-between sticky top-0 z-40">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Gestão de Inventário</span>
            <h1 className="text-sm font-black uppercase text-slate-900">{id ? 'Editar Imóvel' : 'Novo Imóvel'}</h1>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate('/imoveis')} className="px-6 py-2 bg-white border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl">Cancelar</button>
            <button form="imovel-form" disabled={loading} className="px-8 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </header>

        <main className="p-8 md:p-12 max-w-[1400px] mx-auto w-full">
          <form id="imovel-form" onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-10">
            
            <div className="xl:col-span-8 space-y-10">
              {/* 1. Identificação */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-10 space-y-8 shadow-sm">
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center">01</span>
                  Identificação e Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ref. Interna</label>
                    <input value={formData.referencia || ''} onChange={e => setFormData({...formData, referencia: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Código Sistema</label>
                    <input readOnly value={formData.codigo_imovel || ''} className="w-full px-4 py-3 bg-slate-100 border border-slate-100 rounded-xl text-xs font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                    <select value={formData.status_imovel} onChange={e => setFormData({...formData, status_imovel: e.target.value as any})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                      <option value="Disponível">Disponível</option>
                      <option value="Vendido">Vendido</option>
                      <option value="Alugado">Alugado</option>
                      <option value="Suspenso">Suspenso</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Finalidade</label>
                    <select value={formData.finalidade} onChange={e => setFormData({...formData, finalidade: e.target.value as any})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
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
                  <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center">02</span>
                  Dados da Propriedade
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Título do Anúncio</label>
                    <input required value={formData.titulo || ''} onChange={e => setFormData({...formData, titulo: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tipo</label>
                    <select value={formData.tipo_imovel} onChange={e => setFormData({...formData, tipo_imovel: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                      <option>Apartamento</option>
                      <option>Casa</option>
                      <option>Cobertura</option>
                      <option>Terreno</option>
                      <option>Comercial</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Preço Principal (R$)</label>
                    <input type="number" value={formData.finalidade === 'locacao' ? formData.valor_locacao : formData.valor_venda} onChange={e => setFormData({...formData, [formData.finalidade === 'locacao' ? 'valor_locacao' : 'valor_venda']: Number(e.target.value)})} className="w-full px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-black text-indigo-600" />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                   {[
                    { l: 'Área (m²)', k: 'area_m2' },
                    { l: 'Dorms', k: 'dormitorios' },
                    { l: 'Suítes', k: 'suites' },
                    { l: 'Banhs', k: 'banheiros' },
                    { l: 'Vagas', k: 'vagas_garagem' }
                   ].map(item => (
                    <div key={item.k} className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.l}</label>
                      <input type="number" value={(formData as any)[item.k] || 0} onChange={e => setFormData({...formData, [item.k]: Number(e.target.value)})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs" />
                    </div>
                   ))}
                </div>
              </section>

              {/* 3. Localização */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-10 space-y-8 shadow-sm">
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center">03</span>
                  Localização
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bairro</label>
                    <input value={formData.bairro || ''} onChange={e => setFormData({...formData, bairro: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Cidade</label>
                    <input value={formData.cidade || ''} onChange={e => setFormData({...formData, cidade: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">UF</label>
                    <input maxLength={2} value={formData.uf || ''} onChange={e => setFormData({...formData, uf: e.target.value.toUpperCase()})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs" />
                  </div>
                </div>
              </section>

              {/* 4. Características do Imóvel */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-10 space-y-8 shadow-sm">
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center">04</span>
                  Características
                </h3>
                <div className="flex flex-wrap gap-2">
                  {LISTA_CARACTERISTICAS_IMOVEL.map(item => (
                    <button 
                      key={item} 
                      type="button"
                      onClick={() => {
                        const current = formData.caracteristicas_imovel || [];
                        const next = current.includes(item) ? current.filter(c => c !== item) : [...current, item];
                        setFormData({...formData, caracteristicas_imovel: next});
                      }}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all border ${
                        formData.caracteristicas_imovel?.includes(item) ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-100'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar Galeria & Marketing */}
            <div className="xl:col-span-4 space-y-10">
              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-8 flex flex-col min-h-[500px]">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Fotos (Max 15)</h3>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 bg-indigo-600 text-white rounded-lg">
                    <Icons.Plus />
                  </button>
                  <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelection} />
                </div>

                <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-[600px] pr-2">
                  {photos.map((photo, idx) => (
                    <div 
                      key={photo.id}
                      draggable
                      onDragStart={() => onDragStart(idx)}
                      onDragOver={(e) => onDragOver(e, idx)}
                      onDragEnd={() => setDraggedIndex(null)}
                      className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 group cursor-move shadow-sm transition-transform hover:scale-[1.02]"
                    >
                      <img src={photo.preview} className="w-full h-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button type="button" onClick={() => removePhoto(idx)} className="p-2 bg-rose-500 text-white rounded-lg">
                          <Icons.Trash />
                        </button>
                      </div>
                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[8px] font-black text-slate-900 uppercase">
                        {idx === 0 ? 'CAPA' : `#${idx + 1}`}
                      </div>
                    </div>
                  ))}
                  {photos.length === 0 && (
                    <div className="col-span-2 py-20 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-300">
                      <Icons.Building />
                      <p className="text-[9px] font-black uppercase mt-4">Nenhuma foto adicionada</p>
                    </div>
                  )}
                </div>
              </section>

              <section className="bg-slate-950 rounded-[2.5rem] p-8 text-white space-y-6 shadow-2xl">
                 <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40">Marketing</h3>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest">Publicado</span>
                      <div onClick={() => setFormData({...formData, ativo: !formData.ativo})} className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${formData.ativo ? 'bg-indigo-600' : 'bg-white/10'}`}>
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.ativo ? 'right-1' : 'left-1'}`}></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest">Destaque</span>
                      <div onClick={() => setFormData({...formData, destaque: !formData.destaque})} className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${formData.destaque ? 'bg-amber-500' : 'bg-white/10'}`}>
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.destaque ? 'right-1' : 'left-1'}`}></div>
                      </div>
                    </div>
                 </div>
                 <div className="pt-6 border-t border-white/10">
                    <label className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-2 block">Descrição Completa</label>
                    <textarea rows={6} value={formData.descricao || ''} onChange={e => setFormData({...formData, descricao: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-medium outline-none focus:border-indigo-500 transition-all" />
                 </div>
              </section>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default ImovelForm;