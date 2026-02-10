
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Icons, LISTA_CARACTERISTICAS_IMOVEL, LISTA_CARACTERISTICAS_CONDOMINIO, LISTA_PAGAMENTO, LISTA_GARANTIAS } from '../constants';
import { supabase } from '../services/supabase';
import { Imovel } from '../types';

interface PreviewImage {
  file: File;
  preview: string;
}

const ImovelForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [images, setImages] = useState<PreviewImage[]>([]);
  const [negociacao, setNegociacao] = useState<string[]>([]);

  const [formData, setFormData] = useState<Partial<Imovel>>({
    codigo_imovel: '',
    referencia: '',
    titulo: '',
    slug: '',
    descricao: '',
    tipo_imovel: 'Apartamento',
    status_imovel: 'Disponível',
    finalidade: 'venda',
    valor_venda: null,
    valor_locacao: null,
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
    caracteristicas_condominio: []
  });

  useEffect(() => {
    if (!id) {
      generateAutoCode();
    } else {
      fetchImovel();
    }
  }, [id]);

  const generateAutoCode = () => {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const code = `${yy}${mm}${dd}${hh}${min}`;
    setFormData(prev => ({ ...prev, codigo_imovel: code }));
  };

  const fetchImovel = async () => {
    setFetching(true);
    try {
      const { data, error } = await supabase
        .from('imoveis')
        .select('*, imoveis_fotos(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      setFormData(data);
    } catch (err) {
      console.error('Erro ao buscar imóvel:', err);
      alert('Não foi possível carregar os dados do imóvel.');
    } finally {
      setFetching(false);
    }
  };

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  };

  const handleToggleChip = (listName: 'caracteristicas_imovel' | 'caracteristicas_condominio', value: string) => {
    setFormData(prev => {
      const currentList = prev[listName] || [];
      const newList = currentList.includes(value)
        ? currentList.filter(item => item !== value)
        : [...currentList, value];
      return { ...prev, [listName]: newList };
    });
  };

  const handleToggleNegociacao = (value: string) => {
    setNegociacao(prev => prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (images.length + filesArray.length > 15) {
        alert('Limite máximo de 15 fotos atingido.');
        return;
      }
      const newImages = filesArray.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setImages(prev => [...prev, ...newImages]);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo) {
      alert('O título do anúncio é obrigatório.');
      return;
    }

    setLoading(true);
    try {
      const slug = slugify(formData.titulo);
      const payload = { ...formData, slug };
      
      // 1. Insert/Update Imovel
      const { data: imovelData, error: imovelError } = await supabase
        .from('imoveis')
        .upsert(payload)
        .select()
        .single();

      if (imovelError) throw imovelError;

      const imovelId = imovelData.id;

      // 2. Upload Photos if any
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          const fileExt = img.file.name.split('.').pop();
          const fileName = `${imovelId}/${Date.now()}_${i}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('imoveis')
            .upload(fileName, img.file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('imoveis')
            .getPublicUrl(fileName);

          const { error: photoError } = await supabase
            .from('imoveis_fotos')
            .insert({
              imovel_id: imovelId,
              url: publicUrl,
              ordem: i,
              is_capa: i === 0
            });

          if (photoError) throw photoError;
        }
      }

      alert('Imóvel salvo com sucesso!');
      navigate('/imoveis');
    } catch (err: any) {
      console.error('Erro ao salvar imóvel:', err);
      alert(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl mx-auto mb-6"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-['Inter',_sans-serif] antialiased">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        
        {/* Header Superior */}
        <header className="h-20 w-full bg-white/70 backdrop-blur-xl border-b border-slate-100/80 flex items-center px-8 md:px-12 justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 text-slate-300">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:text-indigo-600" onClick={() => navigate('/imoveis')}>Imóveis</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">NOVA PROPRIEDADE</span>
              </div>
          </div>
          <div className="flex gap-4">
            <button 
              type="button" 
              onClick={() => navigate('/imoveis')}
              className="px-6 py-3 bg-white border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:text-slate-600 transition-all"
            >
              Cancelar
            </button>
            <button 
              form="imovel-form" 
              disabled={loading}
              className="px-10 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-3 disabled:opacity-50"
            >
              {loading ? 'Processando...' : 'Salvar Imóvel'}
            </button>
          </div>
        </header>

        <main className="p-8 md:p-12 max-w-[1400px] mx-auto w-full">
          <form id="imovel-form" onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-10">
            
            {/* Coluna de Dados Principais */}
            <div className="xl:col-span-8 space-y-10">
              
              {/* 1. Identificação e Status */}
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
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Código Sistema (Automático)</label>
                    <input disabled type="text" value={formData.codigo_imovel} className="w-full px-5 py-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-black text-slate-400 cursor-not-allowed" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                    <select value={formData.status_imovel} onChange={e => setFormData({...formData, status_imovel: e.target.value as any})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-indigo-200">
                      <option>Disponível</option>
                      <option>Indisponível</option>
                      <option>Vendido</option>
                      <option>Alugado</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Finalidade</label>
                    <select value={formData.finalidade} onChange={e => setFormData({...formData, finalidade: e.target.value as any})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:border-indigo-200">
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
                    <input required type="text" value={formData.titulo || ''} onChange={e => setFormData({...formData, titulo: e.target.value})} placeholder="Ex: Casa duplex com piscina em condomínio fechado" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold placeholder:text-slate-300 outline-none focus:bg-white focus:border-indigo-200 transition-all" />
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Imóvel</label>
                      <select value={formData.tipo_imovel} onChange={e => setFormData({...formData, tipo_imovel: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none">
                        <option>Casa</option>
                        <option>Apartamento</option>
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
                      <input type="number" value={formData.valor_venda || ''} onChange={e => setFormData({...formData, valor_venda: Number(e.target.value)})} className="w-full px-5 py-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-black text-indigo-600 outline-none focus:border-indigo-300" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor Locação (R$)</label>
                      <input type="number" value={formData.valor_locacao || ''} onChange={e => setFormData({...formData, valor_locacao: Number(e.target.value)})} className="w-full px-5 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-black text-emerald-600 outline-none focus:border-emerald-300" />
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                </div>
              </section>

              {/* 6. Características do Imóvel */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-sm">6</div>
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">CARACTERÍSTICAS DO IMÓVEL</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {LISTA_CARACTERISTICAS_IMOVEL.map(feature => (
                    <button 
                      key={feature} 
                      type="button"
                      onClick={() => handleToggleChip('caracteristicas_imovel', feature)}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                        formData.caracteristicas_imovel?.includes(feature) 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                          : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-indigo-200'
                      }`}
                    >
                      {feature}
                    </button>
                  ))}
                </div>
              </section>

              {/* 7. Características do Condomínio */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-sm">7</div>
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">CARACTERÍSTICAS DO CONDOMÍNIO</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {LISTA_CARACTERISTICAS_CONDOMINIO.map(feature => (
                    <button 
                      key={feature} 
                      type="button"
                      onClick={() => handleToggleChip('caracteristicas_condominio', feature)}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                        formData.caracteristicas_condominio?.includes(feature) 
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100' 
                          : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-emerald-200'
                      }`}
                    >
                      {feature}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar de Configurações e Mídia */}
            <div className="xl:col-span-4 space-y-10">
              
              {/* Toggle de Visibilidade e Destaque */}
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
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{images.length}/15</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                   {images.map((img, i) => (
                     <div key={i} className={`aspect-square rounded-2xl relative group overflow-hidden border-2 ${i === 0 ? 'border-indigo-600' : 'border-transparent'}`}>
                        <img src={img.preview} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2">
                           <button type="button" onClick={() => removeImage(i)} className="text-[8px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-300">Remover</button>
                           {i === 0 && <span className="text-[7px] font-black text-indigo-400 uppercase bg-white/10 px-2 py-0.5 rounded-full">Capa</span>}
                        </div>
                     </div>
                   ))}

                   {images.length < 15 && (
                     <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-300 cursor-pointer hover:border-indigo-400 hover:text-indigo-400 transition-all group"
                     >
                        <svg className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="3" strokeLinecap="round" /></svg>
                        <span className="text-[8px] font-black uppercase tracking-tighter">Adicionar</span>
                     </div>
                   )}
                </div>
                <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
              </section>

              {/* 4. Marketing / Descrição */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 space-y-4 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">MARKETING & DESCRIÇÃO</h3>
                <textarea 
                  rows={8} 
                  value={formData.descricao || ''} 
                  onChange={e => setFormData({...formData, descricao: e.target.value})} 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-medium text-slate-600 outline-none focus:bg-white focus:border-indigo-200 transition-all resize-none" 
                  placeholder="Descreva os diferenciais do imóvel para o portal..."
                />
              </section>

              {/* 8. Opções de Negociação */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 space-y-6 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">NEGOCIAÇÃO</h3>
                <div className="space-y-4">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Pagamento</p>
                  <div className="flex flex-wrap gap-2">
                    {LISTA_PAGAMENTO.map(item => (
                      <button 
                        key={item} 
                        type="button"
                        onClick={() => handleToggleNegociacao(item)}
                        className={`px-3 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${
                          negociacao.includes(item) ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 border-slate-100 text-slate-400'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                  
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mt-6">Garantias (Locação)</p>
                  <div className="flex flex-wrap gap-2">
                    {LISTA_GARANTIAS.map(item => (
                      <button 
                        key={item} 
                        type="button"
                        onClick={() => handleToggleNegociacao(item)}
                        className={`px-3 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${
                          negociacao.includes(item) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-400'
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
