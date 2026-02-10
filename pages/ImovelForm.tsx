
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Icons, LISTA_CARACTERISTICAS, LISTA_COMODIDADES, LISTA_NEGOCIACAO } from '../constants';
import { supabase } from '../services/supabase';
import { Imovel } from '../types';

interface FileWithPreview {
  file: File;
  preview: string;
  isCapa: boolean;
}

const ImovelForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [images, setImages] = useState<FileWithPreview[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<any[]>([]);

  const [formData, setFormData] = useState<Partial<Imovel & { 
    caracteristicas: string[], 
    comodidades: string[], 
    opcoes_negociacao: string[],
    rua?: string,
    numero?: string,
    complemento?: string,
    cep?: string
  }>>({
    status_imovel: 'Disponível',
    finalidade: 'venda',
    ativo: true,
    destaque: false,
    dormitorios: 0,
    suites: 0,
    banheiros: 0,
    vagas_garagem: 0,
    area_m2: 0,
    tipo_imovel: 'Apartamento',
    caracteristicas: [],
    comodidades: [],
    opcoes_negociacao: []
  });

  useEffect(() => {
    if (id) {
      loadImovelData();
    } else {
      generateSystemCode();
    }
  }, [id]);

  const generateSystemCode = () => {
    const now = new Date();
    const code = now.toISOString().slice(2, 10).replace(/-/g, '') + 
                 now.getHours().toString().padStart(2, '0') + 
                 now.getMinutes().toString().padStart(2, '0');
    setFormData(prev => ({ ...prev, codigo_imovel: code }));
  };

  async function loadImovelData() {
    setFetching(true);
    try {
      const { data, error } = await supabase
        .from('imoveis')
        .select('*, imoveis_fotos(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setFormData(data);
        setExistingPhotos(data.imoveis_fotos || []);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setFetching(false);
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const totalPossible = 15 - (images.length + existingPhotos.length);
      
      const filesToAdd = newFiles.slice(0, totalPossible).map((file, index) => ({
        file,
        preview: URL.createObjectURL(file),
        isCapa: images.length === 0 && existingPhotos.length === 0 && index === 0
      }));

      setImages(prev => [...prev, ...filesToAdd]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const setAsCapa = (index: number, isNew: boolean) => {
    if (isNew) {
      setImages(prev => prev.map((img, i) => ({ ...img, isCapa: i === index })));
      setExistingPhotos(prev => prev.map(img => ({ ...img, is_capa: false })));
    } else {
      setExistingPhotos(prev => prev.map((img, i) => ({ ...img, is_capa: i === index })));
      setImages(prev => prev.map(img => ({ ...img, isCapa: false })));
    }
  };

  const toggleArrayItem = (field: string, item: string) => {
    setFormData(prev => {
      const current = (prev as any)[field] || [];
      const updated = current.includes(item) 
        ? current.filter((i: string) => i !== item)
        : [...current, item];
      return { ...prev, [field]: updated };
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Salvar Imóvel
      const slug = formData.titulo?.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '-').replace(/[^\w-]/g, '');

      const { data: savedImovel, error: imovelError } = await supabase
        .from('imoveis')
        .upsert({ ...formData, slug })
        .select()
        .single();

      if (imovelError) throw imovelError;

      const imovelId = savedImovel.id;

      // 2. Upload de Novas Imagens
      for (const img of images) {
        const fileExt = img.file.name.split('.').pop();
        const fileName = `${imovelId}/${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('imoveis')
          .upload(fileName, img.file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('imoveis')
          .getPublicUrl(fileName);

        await supabase.from('imoveis_fotos').insert({
          imovel_id: imovelId,
          url: publicUrl,
          is_capa: img.isCapa,
          ordem: 0
        });
      }

      // 3. Atualizar fotos existentes (capa)
      for (const photo of existingPhotos) {
        await supabase.from('imoveis_fotos').update({ is_capa: photo.is_capa }).eq('id', photo.id);
      }

      navigate('/imoveis');
    } catch (err: any) {
      alert('Erro ao salvar: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center animate-pulse">
        <div className="w-16 h-16 bg-indigo-600 rounded-3xl mx-auto mb-6"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Preparando ambiente...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-['Inter',_sans-serif] antialiased">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        
        {/* Header Fixo */}
        <header className="h-20 w-full bg-white/70 backdrop-blur-xl border-b border-slate-100/80 flex items-center px-8 md:px-12 justify-between sticky top-0 z-40">
           <div className="hidden md:flex items-center gap-2 text-slate-300">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:text-indigo-600" onClick={() => navigate('/imoveis')}>Imóveis</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">NOVA PROPRIEDADE</span>
            </div>
            <div className="flex gap-4">
              <button onClick={() => navigate('/imoveis')} className="px-6 py-3 bg-white border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:text-slate-600 transition-all">Cancelar</button>
              <button form="main-form" disabled={loading} className="px-10 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-3">
                {loading ? 'Processando...' : 'Salvar Imóvel'}
              </button>
            </div>
        </header>

        <main className="p-8 md:p-12 max-w-[1400px] mx-auto w-full">
          <form id="main-form" onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-10">
            
            {/* Coluna Principal */}
            <div className="xl:col-span-8 space-y-10">
              
              {/* 1. Identificação */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-sm">1</div>
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">IDENTIFICAÇÃO E STATUS</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Referência Interna</label>
                    <input type="text" value={formData.referencia || ''} onChange={e => setFormData({...formData, referencia: e.target.value})} placeholder="Ex: REF-001" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Código Sistema</label>
                    <input disabled type="text" value={formData.codigo_imovel || ''} className="w-full px-5 py-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-black text-slate-400 cursor-not-allowed" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                    <select value={formData.status_imovel} onChange={e => setFormData({...formData, status_imovel: e.target.value as any})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold">
                      <option>Disponível</option>
                      <option>Indisponível</option>
                      <option>Vendido</option>
                      <option>Alugado</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Finalidade</label>
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
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-sm">2</div>
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">DADOS DA PROPRIEDADE</h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Título do Anúncio*</label>
                    <input required type="text" value={formData.titulo || ''} onChange={e => setFormData({...formData, titulo: e.target.value})} placeholder="Ex: Apartamento de luxo com vista definitiva para o mar" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold placeholder:text-slate-300" />
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo</label>
                      <select value={formData.tipo_imovel} onChange={e => setFormData({...formData, tipo_imovel: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold">
                        <option>Apartamento</option>
                        <option>Casa</option>
                        <option>Flat</option>
                        <option>Cobertura</option>
                        <option>Terreno</option>
                        <option>Comercial</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Área m²</label>
                      <input type="number" value={formData.area_m2 || ''} onChange={e => setFormData({...formData, area_m2: Number(e.target.value)})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor Venda (R$)</label>
                      <input type="number" value={formData.valor_venda || ''} onChange={e => setFormData({...formData, valor_venda: Number(e.target.value)})} className="w-full px-5 py-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-black text-indigo-600" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor Locação (R$)</label>
                      <input type="number" value={formData.valor_locacao || ''} onChange={e => setFormData({...formData, valor_locacao: Number(e.target.value)})} className="w-full px-5 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-black text-emerald-600" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {['dormitorios', 'suites', 'banheiros', 'vagas_garagem'].map(field => (
                      <div key={field} className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.replace('_', ' ').toUpperCase()}</label>
                        <input type="number" value={(formData as any)[field] || 0} onChange={e => setFormData({...formData, [field]: Number(e.target.value)})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-center" />
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* 3. Localização */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-sm">3</div>
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">LOCALIZAÇÃO</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Bairro</label>
                    <input type="text" value={formData.bairro || ''} onChange={e => setFormData({...formData, bairro: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Cidade</label>
                    <input type="text" value={formData.cidade || ''} onChange={e => setFormData({...formData, cidade: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">UF</label>
                    <input type="text" maxLength={2} value={formData.uf || ''} onChange={e => setFormData({...formData, uf: e.target.value.toUpperCase()})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-center" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">CEP</label>
                    <input type="text" value={formData.cep || ''} onChange={e => setFormData({...formData, cep: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" />
                  </div>
                </div>
              </section>

              {/* 6 & 7: Características e Comodidades */}
              <div className="space-y-10">
                <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-sm">6</div>
                    <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">CARACTERÍSTICAS DO IMÓVEL</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {LISTA_CARACTERISTICAS.map(item => (
                      <button 
                        key={item} 
                        type="button"
                        onClick={() => toggleArrayItem('caracteristicas', item)}
                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                          formData.caracteristicas?.includes(item) 
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                            : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-indigo-200'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-sm">7</div>
                    <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">CARACTERÍSTICAS DO CONDOMÍNIO</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {LISTA_COMODIDADES.map(item => (
                      <button 
                        key={item} 
                        type="button"
                        onClick={() => toggleArrayItem('comodidades', item)}
                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                          formData.comodidades?.includes(item) 
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100' 
                            : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-emerald-200'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            {/* Sidebar de Configurações */}
            <div className="xl:col-span-4 space-y-10">
              
              {/* Card de Configurações Rápidas */}
              <section className="bg-slate-950 rounded-[3rem] p-10 text-white space-y-8 shadow-2xl shadow-slate-200">
                 <h3 className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40">CONFIGURAÇÕES</h3>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between group cursor-pointer" onClick={() => setFormData({...formData, ativo: !formData.ativo})}>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-tight">Publicar Imóvel</p>
                        <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Visível para clientes</p>
                      </div>
                      <div className={`w-12 h-6 rounded-full relative transition-all ${formData.ativo ? 'bg-indigo-500' : 'bg-white/10'}`}>
                         <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.ativo ? 'right-1' : 'left-1'}`}></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between group cursor-pointer" onClick={() => setFormData({...formData, destaque: !formData.destaque})}>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-tight">Destaque Premium</p>
                        <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Topo da vitrine</p>
                      </div>
                      <div className={`w-12 h-6 rounded-full relative transition-all ${formData.destaque ? 'bg-amber-500' : 'bg-white/10'}`}>
                         <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.destaque ? 'right-1' : 'left-1'}`}></div>
                      </div>
                    </div>
                 </div>
              </section>

              {/* 5. Galeria de Fotos */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 space-y-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">GALERIA (ATÉ 15)</h3>
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{images.length + existingPhotos.length}/15</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                   {/* Fotos já existentes (edição) */}
                   {existingPhotos.map((p, i) => (
                     <div key={`exist-${i}`} className={`aspect-square rounded-2xl relative group overflow-hidden border-2 ${p.is_capa ? 'border-indigo-600' : 'border-transparent'}`}>
                        <img src={p.url} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2">
                           <button type="button" onClick={() => setAsCapa(i, false)} className="text-[8px] font-black text-white uppercase tracking-widest hover:text-indigo-400">Capa</button>
                        </div>
                     </div>
                   ))}

                   {/* Novas Fotos */}
                   {images.map((img, i) => (
                     <div key={`new-${i}`} className={`aspect-square rounded-2xl relative group overflow-hidden border-2 ${img.isCapa ? 'border-indigo-600' : 'border-transparent'}`}>
                        <img src={img.preview} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2">
                           <button type="button" onClick={() => removeImage(i)} className="text-[8px] font-black text-rose-400 uppercase tracking-widest">Remover</button>
                           <button type="button" onClick={() => setAsCapa(i, true)} className="text-[8px] font-black text-white uppercase tracking-widest">Capa</button>
                        </div>
                     </div>
                   ))}

                   {images.length + existingPhotos.length < 15 && (
                     <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-300 cursor-pointer hover:border-indigo-400 hover:text-indigo-400 transition-all group"
                     >
                        <svg className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="3" strokeLinecap="round" /></svg>
                        <span className="text-[8px] font-black uppercase tracking-tighter">Adicionar</span>
                     </div>
                   )}
                </div>
                <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
              </section>

              {/* 4. Marketing e Negociação */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 space-y-6 shadow-sm">
                 <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">MARKETING & NEGOCIAÇÃO</h3>
                 <div className="space-y-4">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição Comercial</label>
                    <textarea 
                      rows={8} 
                      value={formData.descricao || ''} 
                      onChange={e => setFormData({...formData, descricao: e.target.value})} 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium text-slate-600 outline-none focus:bg-white focus:border-indigo-200 transition-all resize-none" 
                      placeholder="Fale sobre os diferenciais..."
                    />
                 </div>

                 <div className="pt-4 border-t border-slate-50 space-y-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Formas de Negociação</p>
                    <div className="flex flex-wrap gap-2">
                      {LISTA_NEGOCIACAO.map(item => (
                        <button 
                          key={item} 
                          type="button"
                          onClick={() => toggleArrayItem('opcoes_negociacao', item)}
                          className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${
                            formData.opcoes_negociacao?.includes(item) 
                              ? 'bg-slate-900 border-slate-900 text-white' 
                              : 'bg-white border-slate-100 text-slate-400'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
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
