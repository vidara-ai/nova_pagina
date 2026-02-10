
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
  url?: string; // Preenchido se já estiver no R2
  isNew: boolean;
}

// Estado inicial imutável para garantir que nenhum campo seja undefined
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
    if (id) fetchImovel();
    else setFormData({ ...INITIAL_FORM_STATE, codigo_imovel: `IMV-${Math.floor(1000 + Math.random() * 9000)}` });
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
        // MERGE SEGURO: Garante que arrays nulos do banco voltem a ser arrays vazios
        setFormData({
          ...INITIAL_FORM_STATE,
          ...data,
          caracteristicas_imovel: data.caracteristicas_imovel || [],
          caracteristicas_condominio: data.caracteristicas_condominio || [],
          opcoes_negociacao: data.opcoes_negociacao || []
        });

        // Reidratação das fotos
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
      console.error('Erro ao carregar:', err);
      alert('Erro ao recuperar dados do imóvel.');
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
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => {
      const item = prev[index];
      if (item.isNew) URL.revokeObjectURL(item.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Drag and Drop Logic
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
      // 1. Salvar Imóvel (Upsert)
      const { data: savedImovel, error: imovelError } = await supabase
        .from('imoveis')
        .upsert({ 
          ...formData, 
          slug: formData.titulo?.toLowerCase().replace(/ /g, '-'),
          imoveis_fotos: undefined // Removendo campo relacional para não quebrar o insert
        } as any)
        .select()
        .single();

      if (imovelError) throw imovelError;

      // 2. Upload de NOVAS fotos para o R2 via Worker
      const photoPromises = photos.map(async (photo, index) => {
        if (!photo.isNew) return { url: photo.url!, ordem: index };

        const fileName = `prop_${savedImovel.id}_${Date.now()}_${index}.jpg`;
        const uploadResponse = await fetch(`${WORKER_URL}/${fileName}`, {
          method: 'PUT',
          body: photo.file,
          headers: { 'Content-Type': photo.file!.type }
        });

        if (!uploadResponse.ok) throw new Error(`Erro no Worker: ${uploadResponse.statusText}`);
        const { url } = await uploadResponse.json();
        return { url, ordem: index };
      });

      const uploadedPhotos = await Promise.all(photoPromises);

      // 3. Atualizar Tabela de Fotos (Delete & Insert para simplificar ordem)
      await supabase.from('imoveis_fotos').delete().eq('imovel_id', savedImovel.id);
      
      const { error: photosError } = await supabase.from('imoveis_fotos').insert(
        uploadedPhotos.map((p, idx) => ({
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
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-20 text-center font-black uppercase tracking-widest text-slate-300">Carregando Dados...</div>;

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        
        <header className="h-20 w-full bg-white/70 backdrop-blur-xl border-b border-slate-100 flex items-center px-12 justify-between sticky top-0 z-40">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
            {id ? 'Edição de Imóvel' : 'Cadastro de Novo Imóvel'}
          </span>
          <div className="flex gap-4">
            <button onClick={() => navigate('/imoveis')} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50">Cancelar</button>
            <button form="main-form" disabled={loading} className="px-8 py-2.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50">
              {loading ? 'Processando...' : 'Salvar Imóvel'}
            </button>
          </div>
        </header>

        <main className="p-12 max-w-[1400px] mx-auto w-full">
          <form id="main-form" onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-12">
            
            {/* Coluna Dados */}
            <div className="xl:col-span-8 space-y-10">
              
              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-10 space-y-8 shadow-sm">
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-950 rounded-xl flex items-center justify-center text-white text-xs">01</div>
                  Identificação e Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Ref. Interna</label>
                    <input value={formData.referencia || ''} onChange={e => setFormData({...formData, referencia: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold" placeholder="EX: REF-001" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Código Sistema</label>
                    <input readOnly value={formData.codigo_imovel} className="w-full px-5 py-3.5 bg-slate-100 border border-slate-100 rounded-2xl text-xs font-black text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                    <select value={formData.status_imovel} onChange={e => setFormData({...formData, status_imovel: e.target.value as any})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold">
                      <option value="Disponível">Disponível</option>
                      <option value="Vendido">Vendido</option>
                      <option value="Suspenso">Suspenso</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-10 space-y-8 shadow-sm">
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
                   <div className="w-8 h-8 bg-slate-950 rounded-xl flex items-center justify-center text-white text-xs">02</div>
                   Dados da Propriedade
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Título do Anúncio</label>
                    <input required value={formData.titulo || ''} onChange={e => setFormData({...formData, titulo: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Preço (R$)</label>
                    <input type="number" value={formData.valor_venda || 0} onChange={e => setFormData({...formData, valor_venda: Number(e.target.value)})} className="w-full px-5 py-3.5 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs font-black text-indigo-600" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Área (m²)</label>
                    <input type="number" value={formData.area_m2 || 0} onChange={e => setFormData({...formData, area_m2: Number(e.target.value)})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold" />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {['dormitorios', 'suites', 'banheiros', 'vagas_garagem'].map(field => (
                    <div key={field} className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.replace('_', ' ')}</label>
                      <input type="number" value={(formData as any)[field] || 0} onChange={e => setFormData({...formData, [field]: Number(e.target.value)})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold" />
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-10 space-y-8 shadow-sm">
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3">
                   <div className="w-8 h-8 bg-slate-950 rounded-xl flex items-center justify-center text-white text-xs">03</div>
                   Características & Negociação
                </h3>
                
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Características do Imóvel</label>
                  <div className="flex flex-wrap gap-2">
                    {LISTA_CARACTERISTICAS_IMOVEL.map(item => (
                      <button type="button" key={item} onClick={() => {
                        const current = formData.caracteristicas_imovel || [];
                        setFormData({...formData, caracteristicas_imovel: current.includes(item) ? current.filter(i => i !== item) : [...current, item]});
                      }} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border transition-all ${formData.caracteristicas_imovel?.includes(item) ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* Coluna Galeria */}
            <div className="xl:col-span-4 space-y-10">
              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl flex flex-col min-h-[500px]">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Galeria (Até 15)</h3>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                    <Icons.Plus />
                  </button>
                  <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelection} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {photos.map((photo, idx) => (
                    <div 
                      key={photo.id}
                      draggable
                      onDragStart={() => onDragStart(idx)}
                      onDragOver={(e) => onDragOver(e, idx)}
                      onDragEnd={() => setDraggedIndex(null)}
                      className="relative aspect-square bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden cursor-move group"
                    >
                      <img src={photo.preview} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" onClick={() => removePhoto(idx)} className="p-2 bg-rose-500 text-white rounded-xl shadow-lg">
                          <Icons.Trash />
                        </button>
                      </div>
                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[8px] font-black text-slate-900 uppercase">
                        {idx === 0 ? 'CAPA' : `#${idx + 1}`}
                      </div>
                    </div>
                  ))}
                </div>

                {photos.length === 0 && (
                  <div className="flex-1 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-300">
                    <Icons.Building />
                    <p className="text-[9px] font-black uppercase tracking-widest mt-4">Nenhuma Foto</p>
                  </div>
                )}
              </section>

              <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest opacity-50">Configurações de Marketing</h3>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest">Ativo no Site</span>
                  <div onClick={() => setFormData({...formData, ativo: !formData.ativo})} className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${formData.ativo ? 'bg-indigo-500' : 'bg-white/10'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.ativo ? 'right-1' : 'left-1'}`}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest">Destaque Home</span>
                  <div onClick={() => setFormData({...formData, destaque: !formData.destaque})} className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${formData.destaque ? 'bg-amber-500' : 'bg-white/10'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.destaque ? 'right-1' : 'left-1'}`}></div>
                  </div>
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
