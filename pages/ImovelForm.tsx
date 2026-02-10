
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Icons, LISTA_CARACTERISTICAS_IMOVEL, LISTA_CARACTERISTICAS_CONDOMINIO, LISTA_PAGAMENTO, LISTA_GARANTIAS } from '../constants';
import { supabase } from '../services/supabase';
import { Imovel, ImovelFoto } from '../types';

interface PhotoItem {
  id: string;
  file: File | null;
  preview: string;
  path?: string;
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

// Gerador seguindo o formato yymmddhhmm conforme solicitado
const generateUniqueCode = () => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${yy}${mm}${dd}${hh}${min}`;
};

const ImovelForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState<Partial<Imovel>>(INITIAL_FORM_STATE);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  useEffect(() => {
    if (id) {
      fetchImovel();
    } else {
      setFormData({ ...INITIAL_FORM_STATE, codigo_imovel: generateUniqueCode() });
    }
  }, [id]);

  const getImageUrl = (path: string) => {
    const { data } = supabase.storage.from('imoveis').getPublicUrl(path);
    return data.publicUrl;
  };

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
            preview: getImageUrl(img.path),
            path: img.path,
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
      const remainingSlots = 15 - photos.length;
      if (remainingSlots <= 0) {
        alert("Limite de 15 fotos atingido.");
        return;
      }

      const newFiles = Array.from(e.target.files).slice(0, remainingSlots).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file),
        isNew: true
      }));
      setPhotos(prev => [...prev, ...newFiles]);
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
      // 1. Salvar ou atualizar o imóvel
      const slug = formData.titulo?.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

      const { data: savedImovel, error: imovelError } = await supabase
        .from('imoveis')
        .upsert({ ...formData, slug, imoveis_fotos: undefined } as any)
        .select()
        .single();

      if (imovelError) throw imovelError;

      // 2. Processar uploads para Supabase Storage e coletar paths
      const finalPhotoPaths = await Promise.all(photos.map(async (p, idx) => {
        if (!p.isNew) return { path: p.path!, ordem: idx };

        const fileExt = p.file!.name.split('.').pop();
        const fileName = `${Date.now()}_${idx}.${fileExt}`;
        // Caminho obrigatório: imoveis/{codigo_imovel}/{nome_do_arquivo}
        const storagePath = `${formData.codigo_imovel}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('imoveis')
          .upload(storagePath, p.file!);

        if (uploadError) throw uploadError;
        return { path: uploadData.path, ordem: idx };
      }));

      // 3. Atualizar registros na tabela imoveis_fotos
      // Primeiro remove os antigos para reinserir com a nova ordem/novas fotos
      await supabase.from('imoveis_fotos').delete().eq('imovel_id', savedImovel.id);
      
      const photosToInsert = finalPhotoPaths.map((p, idx) => ({
        imovel_id: savedImovel.id,
        path: p.path,
        ordem: idx,
        is_capa: idx === 0
      }));

      const { error: photosError } = await supabase.from('imoveis_fotos').insert(photosToInsert);
      if (photosError) throw photosError;

      alert('Imóvel e fotos salvos com sucesso!');
      navigate('/imoveis');
    } catch (err: any) {
      alert(`Erro no processo: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recuperando Ficha Técnica...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-['Inter',_sans-serif] antialiased">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <header className="h-20 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center px-8 md:px-12 justify-between sticky top-0 z-40">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Gestão de Inventário</span>
            <h1 className="text-sm font-black uppercase text-slate-900 mt-1">
              {id ? `Editando: ${formData.codigo_imovel}` : 'Cadastrar Imóvel Exclusivo'}
            </h1>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/imoveis')} type="button" className="px-6 py-2.5 bg-white border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all">Cancelar</button>
            <button form="imovel-form" disabled={loading} className="px-8 py-2.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50">
              {loading ? 'Processando...' : 'Confirmar Publicação'}
            </button>
          </div>
        </header>

        <main className="p-8 md:p-12 max-w-[1400px] mx-auto w-full">
          <form id="imovel-form" onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-10">
            <div className="xl:col-span-8 space-y-10">
              {/* Seções do Formulário Reutilizadas */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-10 space-y-8 shadow-sm">
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-8 h-8 bg-slate-950 text-white rounded-lg flex items-center justify-center text-[10px]">01</span>
                  Identificação
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Ref. Interna</label>
                    <input value={formData.referencia || ''} onChange={e => setFormData({...formData, referencia: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:bg-white focus:border-indigo-200 outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Cód. Sistema</label>
                    <input readOnly value={formData.codigo_imovel || ''} className="w-full px-5 py-3.5 bg-slate-100 border border-slate-100 rounded-2xl text-xs font-black text-slate-400 cursor-not-allowed" />
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

              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-10 space-y-8 shadow-sm">
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-8 h-8 bg-slate-950 text-white rounded-lg flex items-center justify-center text-[10px]">02</span>
                  Ficha Técnica
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Título do Anúncio</label>
                    <input required value={formData.titulo || ''} onChange={e => setFormData({...formData, titulo: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:bg-white focus:border-indigo-200 outline-none transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo</label>
                    <select value={formData.tipo_imovel} onChange={e => setFormData({...formData, tipo_imovel: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none">
                      <option>Apartamento</option>
                      <option>Casa</option>
                      <option>Cobertura</option>
                      <option>Terreno</option>
                      <option>Flat</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Investimento (R$)</label>
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

              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-10 space-y-8 shadow-sm">
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-8 h-8 bg-slate-950 text-white rounded-lg flex items-center justify-center text-[10px]">03</span>
                  Características
                </h3>
                <div className="flex flex-wrap gap-2">
                  {LISTA_CARACTERISTICAS_IMOVEL.map(item => (
                    <button key={item} type="button" onClick={() => toggleChip('caracteristicas_imovel', item)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${formData.caracteristicas_imovel?.includes(item) ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'}`}>{item}</button>
                  ))}
                </div>
              </section>
            </div>

            <div className="xl:col-span-4 space-y-10">
              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-8 flex flex-col min-h-[500px]">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Galeria Visual</h3>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Limite: 15 arquivos</span>
                  </div>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"><Icons.Plus /></button>
                  <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelection} />
                </div>
                <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                  {photos.map((photo, idx) => (
                    <div key={photo.id} className={`relative aspect-square rounded-[1.5rem] overflow-hidden bg-slate-50 border group cursor-move shadow-sm transition-all hover:scale-[1.03] ${idx === 0 ? 'border-indigo-400 ring-2 ring-indigo-50' : 'border-slate-100'}`}>
                      <img src={photo.preview} className="w-full h-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                        <div className="flex gap-2">
                           {idx > 0 && <button type="button" onClick={() => reorderPhotos(idx, idx - 1)} className="p-2 bg-white text-slate-900 rounded-lg shadow-lg hover:bg-indigo-50"><Icons.ArrowUp /></button>}
                           {idx < photos.length - 1 && <button type="button" onClick={() => reorderPhotos(idx, idx + 1)} className="p-2 bg-white text-slate-900 rounded-lg shadow-lg hover:bg-indigo-50"><Icons.ArrowDown /></button>}
                        </div>
                        <button type="button" onClick={() => removePhoto(idx)} className="p-2.5 bg-rose-500 text-white rounded-xl shadow-lg hover:bg-rose-600 transition-all"><Icons.Trash /></button>
                      </div>
                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[8px] font-black text-slate-900 uppercase shadow-sm tracking-widest">{idx === 0 ? '⭐ Capa' : `#${idx + 1}`}</div>
                    </div>
                  ))}
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
