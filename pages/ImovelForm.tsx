
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Icons, LISTA_CARACTERISTICAS_IMOVEL, LISTA_CARACTERISTICAS_CONDOMINIO, LISTA_PAGAMENTO, LISTA_GARANTIAS } from '../constants';
import { supabase } from '../services/supabase';
import { Imovel, ImovelFoto } from '../types';

interface ImageItem {
  id: string;
  file: File | null;
  preview: string;
  url?: string;
}

const WORKER_URL = (import.meta as any).env.VITE_WORKER_URL || 'https://orange.seusubdominio.workers.dev';

const ImovelForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const [formData, setFormData] = useState<Partial<Imovel>>({
    codigo_imovel: '',
    titulo: '',
    descricao: '',
    tipo_imovel: 'Apartamento',
    status_imovel: 'Disponível',
    finalidade: 'venda',
    valor_venda: 0,
    valor_locacao: 0,
    dormitorios: 0,
    suites: 0,
    banheiros: 0,
    vagas_garagem: 0,
    area_m2: 0,
    bairro: '',
    cidade: '',
    uf: '',
    destaque: false,
    ativo: true,
    caracteristicas_imovel: [],
    caracteristicas_condominio: [],
    opcoes_negociacao: []
  });

  useEffect(() => {
    if (id) {
      fetchImovel();
    } else {
      generateAutoCode();
    }
  }, [id]);

  const generateAutoCode = () => {
    const code = `IMV-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    setFormData(prev => ({ ...prev, codigo_imovel: code }));
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
        // Garantimos que o merge não remova propriedades do estado inicial por causa de nulls do banco
        setFormData(prev => ({
          ...prev,
          ...data,
          valor_venda: data.valor_venda ?? 0,
          valor_locacao: data.valor_locacao ?? 0,
          caracteristicas_imovel: data.caracteristicas_imovel || [],
          caracteristicas_condominio: data.caracteristicas_condominio || [],
          opcoes_negociacao: data.opcoes_negociacao || []
        }));

        const existingImages = (data.imoveis_fotos || [])
          .sort((a: ImovelFoto, b: ImovelFoto) => a.ordem - b.ordem)
          .map((img: ImovelFoto) => ({
            id: img.id || Math.random().toString(),
            file: null,
            preview: img.url,
            url: img.url
          }));
        setImages(existingImages);
      }
    } catch (err: any) {
      console.error('Erro ao carregar imóvel:', err.message);
    } finally {
      setFetching(false);
    }
  };

  const onDragStart = (index: number) => setDraggedIndex(index);
  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newImages = [...images];
    const item = newImages.splice(draggedIndex, 1)[0];
    newImages.splice(index, 0, item);
    setDraggedIndex(index);
    setImages(newImages);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newItems = filesArray.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file)
      }));
      setImages(prev => [...prev, ...newItems]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      if (!newImages[index].url) {
        URL.revokeObjectURL(newImages[index].preview);
      }
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo) return alert('Título é obrigatório.');
    setLoading(true);

    try {
      const slug = formData.titulo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
      
      const payload = {
        ...formData,
        slug,
        imoveis_fotos: undefined // Remove do payload de upsert para evitar erro de coluna
      };

      const { data: imovelData, error: imovelError } = await supabase
        .from('imoveis')
        .upsert(payload as any)
        .select()
        .single();

      if (imovelError) throw imovelError;
      const imovelId = imovelData.id;

      // Upload de novas imagens para R2
      const finalImageUrls = await Promise.all(images.map(async (img, idx) => {
        if (img.url) return { url: img.url, ordem: idx };

        const ext = img.file!.name.split('.').pop();
        const fileName = `prop_${imovelId}_${Date.now()}_${idx}.${ext}`;

        // Chamada ao Worker com tratamento de erro robusto
        const response = await fetch(`${WORKER_URL}/${fileName}`, {
          method: 'PUT',
          body: img.file,
          headers: { 'Content-Type': img.file!.type }
        }).catch(() => { throw new Error('Não foi possível conectar ao Worker R2. Verifique o VITE_WORKER_URL.')});

        if (!response.ok) throw new Error('Falha no upload para o R2 via Worker.');
        const { url } = await response.json();
        return { url, ordem: idx };
      }));

      // Sincronização de fotos: Deleta as antigas e insere as novas para garantir ordem
      await supabase.from('imoveis_fotos').delete().eq('imovel_id', imovelId);
      
      const photosPayload = finalImageUrls.map((img, idx) => ({
        imovel_id: imovelId,
        url: img.url,
        ordem: idx,
        is_capa: idx === 0
      }));

      const { error: photosError } = await supabase.from('imoveis_fotos').insert(photosPayload);
      if (photosError) throw photosError;

      alert('Imóvel salvo com sucesso!');
      navigate('/imoveis');

    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Recuperando Dados...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-['Inter',_sans-serif] antialiased">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        
        <header className="h-20 w-full bg-white/70 backdrop-blur-xl border-b border-slate-100/80 flex items-center px-8 md:px-12 justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
              {id ? 'EDITAR IMÓVEL' : 'NOVO CADASTRO'}
            </span>
          </div>
          <div className="flex gap-4">
            <button type="button" onClick={() => navigate('/imoveis')} className="px-6 py-3 bg-white border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl">Cancelar</button>
            <button 
              form="imovel-form" 
              disabled={loading}
              className="px-10 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              {loading ? 'SALVANDO...' : 'SALVAR'}
            </button>
          </div>
        </header>

        <main className="p-8 md:p-12 max-w-[1400px] mx-auto w-full">
          <form id="imovel-form" onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-10">
            
            <div className="xl:col-span-8 space-y-10">
              {/* Seção 1: Básicos */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-10 space-y-8 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-950 rounded-2xl flex items-center justify-center text-white font-black text-sm">1</div>
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Básico & Localização</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Título*</label>
                    <input required value={formData.titulo || ''} onChange={e => setFormData({...formData, titulo: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Bairro</label>
                    <input value={formData.bairro || ''} onChange={e => setFormData({...formData, bairro: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                   <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Cidade</label>
                    <input value={formData.cidade || ''} onChange={e => setFormData({...formData, cidade: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">UF</label>
                    <input maxLength={2} value={formData.uf || ''} onChange={e => setFormData({...formData, uf: e.target.value.toUpperCase()})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Área m²</label>
                    <input type="number" value={formData.area_m2 || 0} onChange={e => setFormData({...formData, area_m2: Number(e.target.value)})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold" />
                  </div>
                </div>
              </section>

              {/* Seção 2: Negociação - GARANTE QUE CAMPOS NÃO SOMEM */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-10 space-y-8 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-950 rounded-2xl flex items-center justify-center text-white font-black text-sm">2</div>
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Condições & Valores</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Finalidade</label>
                    <select value={formData.finalidade} onChange={e => setFormData({...formData, finalidade: e.target.value as any})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black">
                      <option value="venda">VENDA</option>
                      <option value="locacao">LOCAÇÃO</option>
                      <option value="venda_locacao">AMBOS</option>
                    </select>
                  </div>
                  
                  {/* Renderização Condicional Protegida */}
                  {(formData.finalidade === 'venda' || formData.finalidade === 'venda_locacao') && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Venda (R$)</label>
                      <input type="number" value={formData.valor_venda || 0} onChange={e => setFormData({...formData, valor_venda: Number(e.target.value)})} className="w-full px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] font-black text-indigo-600" />
                    </div>
                  )}

                  {(formData.finalidade === 'locacao' || formData.finalidade === 'venda_locacao') && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Locação (R$)</label>
                      <input type="number" value={formData.valor_locacao || 0} onChange={e => setFormData({...formData, valor_locacao: Number(e.target.value)})} className="w-full px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-[10px] font-black text-emerald-600" />
                    </div>
                  )}
                </div>
              </section>

              {/* Seção 3: Características */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-10 space-y-8 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-950 rounded-2xl flex items-center justify-center text-white font-black text-sm">3</div>
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Recursos do Imóvel</h3>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {LISTA_CARACTERISTICAS_IMOVEL.map(feat => (
                    <button 
                      key={feat}
                      type="button"
                      onClick={() => {
                        const current = formData.caracteristicas_imovel || [];
                        const next = current.includes(feat) ? current.filter(f => f !== feat) : [...current, feat];
                        setFormData({...formData, caracteristicas_imovel: next});
                      }}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border transition-all ${
                        formData.caracteristicas_imovel?.includes(feat) ? 'bg-slate-950 text-white border-slate-950 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-100'
                      }`}
                    >
                      {feat}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* Coluna Lateral: Galeria & Status */}
            <div className="xl:col-span-4 space-y-8">
              <section className="bg-white rounded-[3rem] border border-slate-100 p-8 shadow-xl flex flex-col min-h-[600px]">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Galeria Ordenável</h3>
                  <span className="text-[9px] font-bold text-slate-300 uppercase">{images.length} fotos</span>
                </div>

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-100 rounded-[2.5rem] p-8 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group mb-8"
                >
                  <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                  <div className="text-slate-300 group-hover:text-indigo-500 transition-colors flex flex-col items-center">
                    <Icons.Plus />
                    <p className="text-[9px] font-black uppercase tracking-widest mt-2">Adicionar Arquivos</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {images.map((img, idx) => (
                    <div 
                      key={img.id}
                      draggable
                      onDragStart={() => onDragStart(idx)}
                      onDragOver={(e) => onDragOver(e, idx)}
                      onDragEnd={() => setDraggedIndex(null)}
                      className="relative aspect-square rounded-[1.5rem] bg-slate-50 border border-slate-100 overflow-hidden cursor-move group shadow-sm transition-all hover:ring-2 hover:ring-indigo-600/20"
                    >
                      <img src={img.preview} className="w-full h-full object-cover" alt="" />
                      <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[8px] font-black text-white uppercase tracking-tighter">
                        {idx === 0 ? 'CAPA' : `#${idx + 1}`}
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 text-rose-500 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-slate-950 rounded-[2.5rem] p-8 text-white space-y-6 shadow-2xl">
                 <h3 className="text-[10px] font-black uppercase opacity-40 tracking-[0.4em]">Configurações Finais</h3>
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest">Ativar Anúncio</span>
                    <div 
                      onClick={() => setFormData({...formData, ativo: !formData.ativo})}
                      className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${formData.ativo ? 'bg-indigo-600' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.ativo ? 'right-1' : 'left-1'}`}></div>
                    </div>
                 </div>
                 <div className="flex items-center justify-between border-t border-white/5 pt-6">
                    <span className="text-[10px] font-black uppercase tracking-widest">Destaque Home</span>
                    <div 
                      onClick={() => setFormData({...formData, destaque: !formData.destaque})}
                      className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${formData.destaque ? 'bg-amber-500' : 'bg-white/10'}`}
                    >
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
