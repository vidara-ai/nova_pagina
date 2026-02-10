
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
        .select('*, imoveis_fotos!imoveis_fotos_imovel_id_fkey(*)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setFormData({
          ...data,
          valor_venda: data.valor_venda || 0,
          valor_locacao: data.valor_locacao || 0,
          dormitorios: data.dormitorios || 0,
          suites: data.suites || 0,
          banheiros: data.banheiros || 0,
          vagas_garagem: data.vagas_garagem || 0,
          area_m2: data.area_m2 || 0,
          caracteristicas_imovel: data.caracteristicas_imovel || [],
          caracteristicas_condominio: data.caracteristicas_condominio || [],
          opcoes_negociacao: data.opcoes_negociacao || []
        });
      }
    } catch (err) {
      console.error('Erro ao buscar imóvel:', err);
      alert('Erro ao carregar os dados.');
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

  const handleToggleChip = (listName: 'caracteristicas_imovel' | 'caracteristicas_condominio' | 'opcoes_negociacao', value: string) => {
    setFormData(prev => {
      const currentList = (prev as any)[listName] || [];
      const newList = currentList.includes(value)
        ? currentList.filter((item: string) => item !== value)
        : [...currentList, value];
      return { ...prev, [listName]: newList };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
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
    if (!formData.titulo) return alert('Título é obrigatório.');

    setLoading(true);
    try {
      const slug = slugify(formData.titulo);
      const { imoveis_fotos, ...pureData } = formData as any;
      const payload = { ...pureData, slug };
      
      const { data: imovelData, error: imovelError } = await supabase
        .from('imoveis')
        .upsert(payload)
        .select()
        .single();

      if (imovelError) throw imovelError;

      const imovelId = imovelData.id;

      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          const fileExt = img.file.name.split('.').pop();
          const fileName = `${imovelId}/${Date.now()}_${i}.${fileExt}`;
          const { error: uploadError } = await supabase.storage.from('imoveis').upload(fileName, img.file);
          if (uploadError) throw uploadError;
          const { data: { publicUrl } } = supabase.storage.from('imoveis').getPublicUrl(fileName);
          await supabase.from('imoveis_fotos').insert({ imovel_id: imovelId, url: publicUrl, ordem: i, is_capa: i === 0 });
        }
      }

      alert('Salvo com sucesso!');
      navigate('/imoveis');
    } catch (err: any) {
      console.error(err);
      alert(`Erro: ${err.message}. Verifique se a coluna 'opcoes_negociacao' existe no banco.`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center animate-pulse">
        <div className="w-16 h-16 bg-indigo-600 rounded-3xl mx-auto mb-6"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Carregando...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-['Inter',_sans-serif] antialiased">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <header className="h-20 w-full bg-white/70 backdrop-blur-xl border-b border-slate-100/80 flex items-center px-8 md:px-12 justify-between sticky top-0 z-40">
          <div className="hidden md:flex items-center gap-2 text-slate-300">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer" onClick={() => navigate('/imoveis')}>Imóveis</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">EDIÇÃO / CADASTRO</span>
          </div>
          <div className="flex gap-4">
            <button type="button" onClick={() => navigate('/imoveis')} className="px-6 py-3 bg-white border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl">Cancelar</button>
            <button form="imovel-form" disabled={loading} className="px-10 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
              {loading ? 'Salvando...' : 'Salvar Imóvel'}
            </button>
          </div>
        </header>

        <main className="p-8 md:p-12 max-w-[1400px] mx-auto w-full">
          <form id="imovel-form" onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-10">
            <div className="xl:col-span-8 space-y-10">
              <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-sm">1</div>
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">IDENTIFICAÇÃO E STATUS</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Código</label>
                    <input disabled type="text" value={formData.codigo_imovel} className="w-full px-5 py-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-black text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                    <select value={formData.status_imovel} onChange={e => setFormData({...formData, status_imovel: e.target.value as any})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold">
                      <option>Disponível</option>
                      <option>Indisponível</option>
                      <option>Vendido</option>
                      <option>Alugado</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Finalidade</label>
                    <select value={formData.finalidade} onChange={e => setFormData({...formData, finalidade: e.target.value as any})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold">
                      <option value="venda">Venda</option>
                      <option value="locacao">Locação</option>
                      <option value="venda_locacao">Venda e Locação</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-sm">2</div>
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">DADOS E VALORES</h3>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Título do Anúncio*</label>
                    <input required type="text" value={formData.titulo || ''} onChange={e => setFormData({...formData, titulo: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold" />
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Área m²</label>
                      <input type="number" value={formData.area_m2 || 0} onChange={e => setFormData({...formData, area_m2: Number(e.target.value)})} className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold" />
                    </div>
                    {(formData.finalidade === 'venda' || formData.finalidade === 'venda_locacao') && (
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Venda (R$)</label>
                        <input type="number" value={formData.valor_venda || 0} onChange={e => setFormData({...formData, valor_venda: Number(e.target.value)})} className="w-full px-5 py-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-black text-indigo-600" />
                      </div>
                    )}
                    {(formData.finalidade === 'locacao' || formData.finalidade === 'venda_locacao') && (
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Locação (R$)</label>
                        <input type="number" value={formData.valor_locacao || 0} onChange={e => setFormData({...formData, valor_locacao: Number(e.target.value)})} className="w-full px-5 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-black text-emerald-600" />
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-sm">3</div>
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">NEGOCIAÇÃO</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[...LISTA_PAGAMENTO, ...LISTA_GARANTIAS].map(item => (
                    <button key={item} type="button" onClick={() => handleToggleChip('opcoes_negociacao', item)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border transition-all ${formData.opcoes_negociacao?.includes(item) ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                      {item}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <div className="xl:col-span-4 space-y-10">
              <section className="bg-slate-950 rounded-[3rem] p-10 text-white space-y-8 shadow-2xl">
                 <h3 className="text-[11px] font-black uppercase opacity-40 tracking-widest">PUBLICAÇÃO</h3>
                 <div className="space-y-6">
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => setFormData({...formData, ativo: !formData.ativo})}>
                      <span className="text-[10px] font-black uppercase tracking-widest">Publicar Imóvel</span>
                      <div className={`w-12 h-6 rounded-full relative ${formData.ativo ? 'bg-indigo-500' : 'bg-white/10'}`}>
                         <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.ativo ? 'right-1' : 'left-1'}`}></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => setFormData({...formData, destaque: !formData.destaque})}>
                      <span className="text-[10px] font-black uppercase tracking-widest">Destaque</span>
                      <div className={`w-12 h-6 rounded-full relative ${formData.destaque ? 'bg-amber-500' : 'bg-white/10'}`}>
                         <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.destaque ? 'right-1' : 'left-1'}`}></div>
                      </div>
                    </div>
                 </div>
              </section>

              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-6">
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest text-center">GALERIA</h3>
                <div className="grid grid-cols-3 gap-3">
                   {images.map((img, i) => (
                     <div key={i} className="aspect-square rounded-2xl relative overflow-hidden border-2 border-slate-50">
                        <img src={img.preview} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-white/80 p-1 rounded-lg text-rose-500 shadow-sm">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                        </button>
                     </div>
                   ))}
                   <div onClick={() => fileInputRef.current?.click()} className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-300 cursor-pointer hover:border-indigo-200 hover:text-indigo-400 transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="3" strokeLinecap="round" /></svg>
                   </div>
                </div>
                <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
              </section>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default ImovelForm;
