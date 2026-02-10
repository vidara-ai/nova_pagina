
import React from 'react';
import Sidebar from '../components/Sidebar';
import { Icons } from '../constants';

const ImovelForm: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-['Inter',_sans-serif] antialiased">
      {/* Sidebar Reutilizada */}
      <Sidebar />

      {/* Main Layout Container */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        
        {/* Header Administrativo Premium */}
        <header className="h-20 w-full bg-white/70 backdrop-blur-xl border-b border-slate-100/80 flex items-center px-8 md:px-12 justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-slate-300">
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Dashboard</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Novo Imóvel</span>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="text-right">
                <p className="text-xs font-black text-slate-900 uppercase tracking-tight leading-none">Marlon Sales</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Master Broker</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-indigo-200 transition-all">
                <Icons.Users />
              </div>
            </div>
          </div>
        </header>

        {/* Form Content Area */}
        <main className="p-8 md:p-12 max-w-[1400px] mx-auto w-full space-y-12 animate-in fade-in duration-700">
          
          {/* Page Header & Actions */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-2">
              <h2 className="text-4xl md:text-5xl font-black text-slate-950 uppercase tracking-tighter leading-[0.85]">
                Gestão de <span className="text-slate-300">Propriedade</span>
              </h2>
              <p className="text-slate-500 text-sm font-medium tracking-tight">
                Preencha os detalhes técnicos para publicar este imóvel na Vitrine Digital.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="px-6 py-4 bg-white border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:text-slate-600 transition-all">
                Cancelar
              </button>
              <button className="px-10 py-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
                Publicar Imóvel
              </button>
            </div>
          </div>

          <form className="grid grid-cols-1 xl:grid-cols-12 gap-12">
            
            {/* Coluna Esquerda: Dados Principais */}
            <div className="xl:col-span-8 space-y-8">
              
              {/* Seção 1: Informações Gerais */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-10 space-y-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Informações Gerais</h3>
                  <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Icons.Dashboard />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Título do Anúncio</label>
                    <input 
                      type="text" 
                      name="titulo"
                      placeholder="Ex: Cobertura Duplex no Leblon com vista total mar"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo de Imóvel</label>
                    <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-200 transition-all appearance-none">
                      <option>Apartamento</option>
                      <option>Casa de Condomínio</option>
                      <option>Cobertura</option>
                      <option>Casa de Vila</option>
                      <option>Lote / Terreno</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Slug (URL amigável)</label>
                    <input 
                      type="text" 
                      name="slug"
                      placeholder="cobertura-duplex-leblon-vista-mar"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-400 outline-none focus:bg-white focus:border-indigo-200 transition-all"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição Detalhada</label>
                    <textarea 
                      rows={6}
                      name="descricao"
                      placeholder="Descreva as características únicas, diferenciais de acabamento e o estilo de vida que o imóvel proporciona..."
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-200 transition-all resize-none"
                    />
                  </div>
                </div>
              </section>

              {/* Seção 2: Características Técnicas */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-10 space-y-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Atributos da Unidade</h3>
                  <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Icons.Orders />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Área m²</label>
                    <input type="number" name="area" placeholder="0" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:bg-white transition-all text-center" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Dorms</label>
                    <input type="number" name="dormitorios" placeholder="0" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:bg-white transition-all text-center" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Suítes</label>
                    <input type="number" name="suites" placeholder="0" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:bg-white transition-all text-center" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Banhs</label>
                    <input type="number" name="banheiros" placeholder="0" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:bg-white transition-all text-center" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Vagas</label>
                    <input type="number" name="vagas" placeholder="0" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:bg-white transition-all text-center" />
                  </div>
                </div>
              </section>

              {/* Seção 3: Localização */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-10 space-y-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Localização e Endereço</h3>
                  <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">CEP</label>
                    <input type="text" placeholder="00000-000" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:bg-white transition-all" />
                  </div>
                  <div className="md:col-span-4 space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Logradouro / Rua</label>
                    <input type="text" placeholder="Avenida Vieira Souto..." className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:bg-white transition-all" />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Bairro</label>
                    <input type="text" placeholder="Ipanema" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:bg-white transition-all" />
                  </div>
                  <div className="md:col-span-3 space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Cidade</label>
                    <input type="text" placeholder="Rio de Janeiro" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:bg-white transition-all" />
                  </div>
                  <div className="md:col-span-1 space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">UF</label>
                    <input type="text" placeholder="RJ" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:bg-white transition-all text-center" />
                  </div>
                </div>
              </section>
            </div>

            {/* Coluna Direita: Valores, Status e Fotos */}
            <div className="xl:col-span-4 space-y-8">
              
              {/* Seção 4: Valores e Disponibilidade */}
              <section className="bg-slate-950 rounded-[3rem] p-10 text-white space-y-10 shadow-2xl shadow-slate-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 transform translate-x-12 -translate-y-12 scale-[2.5]">
                  <Icons.Dashboard />
                </div>
                
                <div className="relative z-10 space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Investimento</h3>
                    <div className="w-8 h-8 bg-white/10 text-white rounded-xl flex items-center justify-center border border-white/10">
                      <Icons.Settings />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">Valor de Venda</label>
                      <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xs font-black text-white/30">R$</span>
                        <input type="text" placeholder="0,00" className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-lg font-black text-white outline-none focus:bg-white/10 focus:border-indigo-400 transition-all" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">Valor de Locação (Mensal)</label>
                      <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xs font-black text-white/30">R$</span>
                        <input type="text" placeholder="0,00" className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-lg font-black text-white outline-none focus:bg-white/10 focus:border-indigo-400 transition-all" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/10 space-y-6">
                    <div className="flex items-center justify-between group cursor-pointer">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-tight">Imóvel Ativo</p>
                        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Visível no catálogo público</p>
                      </div>
                      <div className="w-12 h-6 bg-indigo-600 rounded-full relative">
                        <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between group cursor-pointer">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-tight">Destaque Premium</p>
                        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Exibição na Home e Topo</p>
                      </div>
                      <div className="w-12 h-6 bg-white/10 rounded-full relative">
                        <div className="absolute top-1 left-1 w-4 h-4 bg-white/30 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Seção 5: Galeria de Imagens */}
              <section className="bg-white rounded-[2.5rem] border border-slate-100 p-10 space-y-8 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Mídia e Fotos</h3>
                  <div className="w-8 h-8 bg-slate-50 text-slate-300 rounded-xl flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="aspect-[4/3] bg-slate-50 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center p-8 text-center group cursor-pointer hover:border-indigo-200 hover:bg-slate-50/50 transition-all">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-300 mb-4 group-hover:scale-110 group-hover:text-indigo-400 transition-all">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload de Imagens</p>
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tight mt-1">Arraste arquivos ou clique para selecionar (Máx 20MB)</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="aspect-square bg-slate-100 rounded-2xl relative overflow-hidden group">
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button className="p-2 bg-white text-rose-500 rounded-lg hover:scale-110 transition-transform">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-300 uppercase tracking-widest">Foto 01</div>
                    </div>
                    <div className="aspect-square bg-slate-100 rounded-2xl relative overflow-hidden group border-2 border-indigo-500">
                      <div className="absolute top-2 left-2 px-2 py-1 bg-indigo-500 text-white text-[8px] font-black uppercase rounded-lg">Capa</div>
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Foto 02</div>
                    </div>
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
