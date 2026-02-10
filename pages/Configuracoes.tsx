
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { Icons } from '../constants';
import { supabase } from '../services/supabase';

interface AppConfig {
  id?: string;
  header_nome_site: string;
  color_scheme: string;
  whatsapp_header: string;
  whatsapp_msg_header: string;
  whatsapp_floating: string;
  whatsapp_msg_floating: string;
  whatsapp_imovel: string;
  whatsapp_msg_imovel: string;
  hero_titulo: string;
  hero_subtitulo: string;
  hero_bg_desktop_url: string;
  footer_titulo: string;
  footer_telefone: string;
  footer_bio: string;
  footer_form_titulo: string;
  footer_form_subtitulo: string;
  footer_creci: string;
  footer_instagram_url: string;
  footer_tiktok_url: string;
  footer_x_url: string;
  footer_linkedin_url: string;
  footer_copyright: string;
}

const INITIAL_STATE: AppConfig = {
  header_nome_site: '',
  color_scheme: 'indigo',
  whatsapp_header: '',
  whatsapp_msg_header: '',
  whatsapp_floating: '',
  whatsapp_msg_floating: '',
  whatsapp_imovel: '',
  whatsapp_msg_imovel: '',
  hero_titulo: '',
  hero_subtitulo: '',
  hero_bg_desktop_url: '',
  footer_titulo: '',
  footer_telefone: '',
  footer_bio: '',
  footer_form_titulo: '',
  footer_form_subtitulo: '',
  footer_creci: '',
  footer_instagram_url: '',
  footer_tiktok_url: '',
  footer_x_url: '',
  footer_linkedin_url: '',
  footer_copyright: ''
};

const Configuracoes: React.FC = () => {
  const [config, setConfig] = useState<AppConfig>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setFetching(true);
      const { data, error } = await supabase
        .from('configuracoes_site')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      if (data) {
        // Alinhamento direto do retorno para o state conforme regra
        setConfig({ ...INITIAL_STATE, ...data });
        if (data.hero_bg_desktop_url) {
          const { data: publicUrl } = supabase.storage.from('imoveis').getPublicUrl(data.hero_bg_desktop_url);
          setHeroPreview(publicUrl.publicUrl);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar configurações:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleHeroImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview local imediato
    setHeroPreview(URL.createObjectURL(file));

    setLoading(true);
    try {
      const fileName = `hero_${Date.now()}.${file.name.split('.').pop()}`;
      const filePath = `config/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('imoveis')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Salva apenas o PATH na coluna correta
      setConfig(prev => ({ ...prev, hero_bg_desktop_url: filePath }));
    } catch (err: any) {
      alert(`Erro no upload: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('configuracoes_site')
        .upsert({
          ...config,
          id: config.id || undefined,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      alert('Configurações aplicadas com sucesso!');
      fetchConfig();
    } catch (err: any) {
      alert(`Erro ao salvar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Carregando Sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-['Inter',_sans-serif] antialiased">
      <Sidebar />

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <header className="h-20 w-full bg-white/70 backdrop-blur-xl border-b border-slate-100/80 flex items-center px-8 md:px-12 justify-between sticky top-0 z-40">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Personalização</span>
            <h1 className="text-sm font-black uppercase text-slate-900 mt-1">Configurações do Site</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={handleSave}
              disabled={loading}
              className="px-8 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Aplicar Alterações'}
            </button>
          </div>
        </header>

        <main className="p-8 md:p-12 max-w-[1200px] mx-auto w-full space-y-12 animate-in fade-in duration-700">
          
          {/* 1. Cabeçalho e Identidade */}
          <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-10 space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-950 text-white rounded-2xl flex items-center justify-center text-xs font-black">01</div>
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Cabeçalho e Identidade</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Imobiliária</label>
                <input 
                  type="text" 
                  name="header_nome_site"
                  value={config.header_nome_site}
                  onChange={handleInputChange}
                  placeholder="Ex: Vitrine Digital"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-200 transition-all"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Esquema de Cores</label>
                <select 
                  name="color_scheme"
                  value={config.color_scheme}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 outline-none transition-all cursor-pointer"
                >
                  <option value="indigo">Índigo Premium (Padrão)</option>
                  <option value="slate">Slate Modern</option>
                  <option value="emerald">Emerald Nature</option>
                  <option value="rose">Rose Luxury</option>
                  <option value="amber">Amber Classic</option>
                  <option value="light">Light Minimal</option>
                </select>
              </div>
            </div>
          </section>

          {/* 2. WhatsApp — Mensagens e Números */}
          <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-10 space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#25D366] text-white rounded-2xl flex items-center justify-center text-xs font-black">02</div>
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">WhatsApp — Mensagens e Números</h3>
            </div>

            <div className="space-y-12">
              {/* 2.1 Header */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-slate-100 pl-4">Botão WhatsApp do Header</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Número WhatsApp Header</label>
                    <input type="text" name="whatsapp_header" value={config.whatsapp_header} onChange={handleInputChange} placeholder="Ex: 83999999999" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Mensagem WhatsApp Header</label>
                    <input type="text" name="whatsapp_msg_header" value={config.whatsapp_msg_header} onChange={handleInputChange} placeholder="Olá, gostaria de mais informações..." className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:bg-white transition-all" />
                  </div>
                </div>
              </div>

              {/* 2.2 Flutuante */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-slate-100 pl-4">Botão WhatsApp Flutuante</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Número WhatsApp Botão Flutuante</label>
                    <input type="text" name="whatsapp_floating" value={config.whatsapp_floating} onChange={handleInputChange} placeholder="Ex: 83999999999" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Mensagem WhatsApp Botão Flutuante</label>
                    <input type="text" name="whatsapp_msg_floating" value={config.whatsapp_msg_floating} onChange={handleInputChange} placeholder="Estou navegando no site e preciso de ajuda..." className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:bg-white transition-all" />
                  </div>
                </div>
              </div>

              {/* 2.3 Página do Imóvel */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-slate-100 pl-4">Botão WhatsApp da Página do Imóvel</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Número WhatsApp Página do Imóvel</label>
                    <input type="text" name="whatsapp_imovel" value={config.whatsapp_imovel} onChange={handleInputChange} placeholder="Ex: 83999999999" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Mensagem WhatsApp Página do Imóvel</label>
                    <input type="text" name="whatsapp_msg_imovel" value={config.whatsapp_msg_imovel} onChange={handleInputChange} placeholder="Olá, tenho interesse no imóvel {{titulo}}..." className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:bg-white transition-all" />
                  </div>
                  <div className="md:col-span-2 p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Variáveis Disponíveis:</p>
                    <div className="flex flex-wrap gap-2">
                      {['{{titulo}}', '{{referencia}}', '{{bairro}}', '{{cidade}}'].map(v => (
                        <span key={v} className="px-3 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-bold text-indigo-600">{v}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Hero / Destaque Principal */}
          <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-10 space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-xs font-black">03</div>
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Hero / Destaque Principal</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Título Principal</label>
                  <input type="text" name="hero_titulo" value={config.hero_titulo} onChange={handleInputChange} placeholder="Ex: Encontre o lugar ideal..." className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:bg-white transition-all" />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Subtítulo</label>
                  <textarea name="hero_subtitulo" value={config.hero_subtitulo} onChange={handleInputChange} rows={3} placeholder="Descrição curta abaixo do título..." className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:bg-white transition-all resize-none" />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Imagem de Fundo (Hero)</label>
                <div className="relative group aspect-video rounded-3xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 transition-all hover:border-indigo-300">
                  {heroPreview ? (
                    <>
                      <img src={heroPreview} className="w-full h-full object-cover" alt="Hero Preview" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl hover:bg-indigo-50 transition-all">Alterar Imagem</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-4 bg-white rounded-2xl text-slate-300"><Icons.Dashboard /></div>
                      <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-slate-950 text-white text-[10px] font-black uppercase tracking-widest rounded-xl">Upload Hero</button>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleHeroImageChange} accept="image/*" className="hidden" />
                </div>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest text-center">Recomendado: 1920x1080px • Max 2MB</p>
              </div>
            </div>
          </section>

          {/* 4. Footer do Site */}
          <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-10 space-y-12">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-200 text-slate-600 rounded-2xl flex items-center justify-center text-xs font-black">04</div>
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Estrutura do Rodapé</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              
              {/* Bloco Institucional */}
              <div className="space-y-8">
                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Bloco Institucional</h4>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Título do Footer</label>
                    <input type="text" name="footer_titulo" value={config.footer_titulo} onChange={handleInputChange} placeholder="Ex: Vitrine Digital" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefone para Exibição</label>
                    <input type="text" name="footer_telefone" value={config.footer_telefone} onChange={handleInputChange} placeholder="Ex: 83 3221.0008" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Bio / Descrição Curta</label>
                    <textarea name="footer_bio" value={config.footer_bio} onChange={handleInputChange} rows={4} placeholder="Redefinindo a busca por excelência imobiliária..." className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:bg-white transition-all resize-none" />
                  </div>
                </div>
              </div>

              {/* Formulário do Footer */}
              <div className="space-y-8">
                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Formulário de Contato do Footer</h4>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Título Formulário Footer</label>
                    <input type="text" name="footer_form_titulo" value={config.footer_form_titulo} onChange={handleInputChange} placeholder="Ex: Como podemos ajudar?" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Subtítulo Formulário Footer</label>
                    <input type="text" name="footer_form_subtitulo" value={config.footer_form_subtitulo} onChange={handleInputChange} placeholder="Ex: Selecione seu interesse abaixo" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:bg-white transition-all" />
                  </div>
                </div>
              </div>

            </div>

            <div className="pt-12 border-t border-slate-50 grid grid-cols-1 lg:grid-cols-2 gap-16">
              
              {/* Informações Legais */}
              <div className="space-y-8">
                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Informações Legais</h4>
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Texto do CRECI</label>
                  <input type="text" name="footer_creci" value={config.footer_creci} onChange={handleInputChange} placeholder="Ex: CRECI 45678-J" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:bg-white transition-all" />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Texto de Copyright (Final)</label>
                  <input type="text" name="footer_copyright" value={config.footer_copyright} onChange={handleInputChange} placeholder="Ex: © 2025 Vitrine Digital — Todos os direitos reservados" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:bg-white transition-all" />
                </div>
              </div>

              {/* Redes Sociais */}
              <div className="space-y-8">
                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Redes Sociais (Links Completos)</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Instagram URL</label>
                    <input type="url" name="footer_instagram_url" value={config.footer_instagram_url} onChange={handleInputChange} placeholder="https://instagram.com/..." className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold outline-none focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">TikTok URL</label>
                    <input type="url" name="footer_tiktok_url" value={config.footer_tiktok_url} onChange={handleInputChange} placeholder="https://tiktok.com/@..." className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold outline-none focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">X (Twitter) URL</label>
                    <input type="url" name="footer_x_url" value={config.footer_x_url} onChange={handleInputChange} placeholder="https://twitter.com/..." className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold outline-none focus:bg-white transition-all" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">LinkedIn URL</label>
                    <input type="url" name="footer_linkedin_url" value={config.footer_linkedin_url} onChange={handleInputChange} placeholder="https://linkedin.com/in/..." className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold outline-none focus:bg-white transition-all" />
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* Botão de Rodapé para facilitar salvamento */}
          <div className="flex items-center justify-center p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem]">
             <button 
              onClick={handleSave}
              disabled={loading}
              className="px-12 py-5 bg-slate-950 text-white text-xs font-black uppercase tracking-[0.4em] rounded-[2rem] shadow-2xl hover:bg-indigo-600 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Sincronizando...' : 'Salvar Todas as Configurações'}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Configuracoes;
