
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Icons, LISTA_CARACTERISTICAS_IMOVEL, LISTA_CARACTERISTICAS_CONDOMINIO, LISTA_PAGAMENTO, LISTA_GARANTIAS } from '../constants';
import { supabase } from '../services/supabase';
import { Imovel } from '../types';

interface ImageItem {
  id: string;
  file: File | null;
  preview: string;
  url?: string; // Preenchido apenas para imagens já salvas (edição)
}

const WORKER_URL = 'https://seu-worker.seusubdominio.workers.dev'; // Configure sua URL do Worker

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
    referencia: '',
    titulo: '',
    slug: '',
    descricao: '',
    tipo_imovel: 'Apartamento',
    status_imovel: 'Disponível',
    finalidade: 'venda',
    valor_venda: 0,
    valor_locacao: 0,
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
    if (!id) {
      generateAutoCode();
    } else {
      fetchImovel();
    }
  }, [id]);

  const generateAutoCode = () => {
    const code = `IMV-${Date.now().toString().slice(-6)}`;
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
        setFormData(data);
        // Carregar imagens existentes na ordem correta
        const existingImages = (data.imoveis_fotos || [])
          .sort((a: any, b: any) => a.ordem - b.ordem)
          .map((img: any) => ({
            id: img.id,
            file: null,
            preview: img.url,
            url: img.url
          }));
        setImages(existingImages);
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setFetching(false);
    }
  };

  // Drag & Drop Handlers (Nativo)
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
      // 1. Salvar ou atualizar o imóvel primeiro
      const { data: imovelData, error: imovelError } = await supabase
        .from('imoveis')
        .upsert({ 
          ...formData, 
          slug: formData.titulo.toLowerCase().replace(/ /g, '-'),
          // Removemos imoveis_fotos do payload de upsert
          imoveis_fotos: undefined 
        } as any)
        .select()
        .single();

      if (imovelError) throw imovelError;
      const imovelId = imovelData.id;

      // 2. Processar uploads para R2 (Apenas arquivos novos)
      const finalImageUrls = await Promise.all(images.map(async (img, idx) => {
        if (img.url) return { url: img.url, ordem: idx };

        const ext = img.file!.name.split('.').pop();
        const fileName = `prop_${imovelId}_${Date.now()}_${idx}.${ext}`;

        const response = await fetch(`${WORKER_URL}/${fileName}`, {
          method: 'PUT',
          body: img.file,
          headers: { 'Content-Type': img.file!.type }
        });

        if (!response.ok) throw new Error('Falha no upload para o R2');
        const { url } = await response.json();
        return { url, ordem: idx };
      }));

      // 3. Limpar fotos antigas e inserir a nova ordem
      await supabase.from('imoveis_fotos').delete().eq('imovel_id', imovelId);
      
      const photosPayload = finalImageUrls.map((img, idx) => ({
        imovel_id: imovelId,
        url: img.url,
        ordem: idx,
        is_capa: idx === 0
      }));

      const { error: photosError } = await supabase.from('imoveis_fotos').insert(photosPayload);
      if (photosError) throw photosError;

      alert('Propriedade salva com sucesso!');
      navigate('/imoveis');

    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-['Inter',_sans-serif] antialiased">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        
        {/* Header Premium */}
        <header className="h-20 w-full bg-white/70 backdrop-blur-xl border-b border-slate-100/80 flex items-center px-8 md:px-12 justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">EDITOR DE PROPRIEDADE</span>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate('/imoveis')} className="px-6 py-3 bg-white border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl">Voltar</button>
            <button 
              form="imovel-form" 
              disabled={loading}
              className="px-10 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              {loading && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              {loading ? 'SALVANDO...' : 'SALVAR IMÓVEL'}
            </button>
          </div>
        </header>

        <main className="p-8 md:p-12 max-w-[1400px] mx-auto w-full">
          <form id="imovel-form" onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-10">
            
            {/* Coluna Principal: Dados */}
            <div className="xl:col-span-8 space-y-10">
              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-10 space-y-8 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-sm">1</div>
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Informações Gerais</h3>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Código</label>
                      <input disabled value={formData.codigo_imovel} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-400" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Título do Anúncio</label>
                      <input required value={formData.titulo || ''} onChange={e => setFormData({...formData, titulo: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição Comercial</label>
                    <textarea rows={4} value={formData.descricao || ''} onChange={e => setFormData({...formData, descricao: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium resize-none" />
                  </div>
                </div>
              </section>

              {/* Seção de Negociação */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-10 space-y-8 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-sm">2</div>
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Condições & Valores</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Finalidade</label>
                    <select value={formData.finalidade} onChange={e => setFormData({...formData, finalidade: e.target.value as any})} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black">
                      <option value="venda">VENDA</option>
                      <option value="locacao">LOCAÇÃO</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Valor</label>
                    <input type="number" value={formData.valor_venda || 0} onChange={e => setFormData({...formData, valor_venda: Number(e.target.value)})} className="w-full px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] font-black text-indigo-600" />
                  </div>
                </div>
              </section>
            </div>

            {/* Coluna Lateral: Galeria e Upload */}
            <div className="xl:col-span-4 space-y-8">
              <section className="bg-white rounded-[3rem] border border-slate-100 p-8 shadow-xl flex flex-col min-h-[500px]">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Galeria de Fotos</h3>
                  <span className="text-[9px] font-bold text-slate-300 uppercase">{images.length} fotos</span>
                </div>

                {/* Drop Zone */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-100 rounded-[2.5rem] p-8 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group mb-8"
                >
                  <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                  <div className="text-slate-300 group-hover:text-indigo-500 transition-colors flex flex-col items-center">
                    <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <p className="text-[9px] font-black uppercase tracking-widest">Adicionar Fotos</p>
                  </div>
                </div>

                {/* Preview Grid com Reordenação Nativa */}
                <div className="grid grid-cols-2 gap-4">
                  {images.map((img, idx) => (
                    <div 
                      key={img.id}
                      draggable
                      onDragStart={() => onDragStart(idx)}
                      onDragOver={(e) => onDragOver(e, idx)}
                      onDragEnd={() => setDraggedIndex(null)}
                      className="relative aspect-square rounded-[1.5rem] bg-slate-50 border border-slate-100 overflow-hidden cursor-move group animate-in fade-in zoom-in duration-300 shadow-sm"
                    >
                      <img src={img.preview} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                      
                      {/* Badge Ordem */}
                      <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[8px] font-black text-white uppercase tracking-tighter">
                        {idx === 0 ? 'CAPA' : `#${idx + 1}`}
                      </div>

                      {/* Botão Remover */}
                      <button 
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 text-rose-500 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/></svg>
                      </button>
                    </div>
                  ))}
                </div>

                {images.length === 0 && (
                  <div className="flex-1 flex items-center justify-center border border-slate-50 rounded-[2rem] bg-slate-50/50">
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Nenhuma foto selecionada</p>
                  </div>
                )}
              </section>

              {/* Configurações de Publicação */}
              <section className="bg-slate-950 rounded-[2.5rem] p-8 text-white space-y-6 shadow-2xl">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest">Visibilidade</span>
                    <div 
                      onClick={() => setFormData({...formData, ativo: !formData.ativo})}
                      className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${formData.ativo ? 'bg-indigo-600' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.ativo ? 'right-1' : 'left-1'}`}></div>
                    </div>
                 </div>
                 <div className="flex items-center justify-between border-t border-white/5 pt-6">
                    <span className="text-[10px] font-black uppercase tracking-widest">Destaque</span>
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
