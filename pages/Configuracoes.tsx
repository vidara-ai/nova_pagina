
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Icons } from '../constants';
import { supabase } from '../services/supabase';

const Configuracoes: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'perfil' | 'seguranca' | 'notificacoes'>('perfil');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Estados dos campos do formulário
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [emailProfissional, setEmailProfissional] = useState('');
  const [biografiaCurta, setBiografiaCurta] = useState('');
  
  // Estados de segurança
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  
  // Estados de privacidade/preferências
  const [perfilPublico, setPerfilPublico] = useState(true);
  const [mostrarEmail, setMostrarEmail] = useState(false);
  const [analiseUso, setAnaliseUso] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setFetching(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setEmailProfissional(user.email || '');
        
        // Tenta buscar na tabela 'configuracoes'
        // Assumindo que o sistema possui uma tabela vinculada por user_id
        const { data, error } = await supabase
          .from('configuracoes')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data) {
          setNomeCompleto(data.nome_completo || '');
          setBiografiaCurta(data.biografia_curta || '');
          setPerfilPublico(data.perfil_publico ?? true);
          setMostrarEmail(data.mostrar_email ?? false);
          setAnaliseUso(data.analise_uso ?? true);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // 1. Atualizar Perfil/Configurações
      const { error: configError } = await supabase
        .from('configuracoes')
        .upsert({
          user_id: user.id,
          nome_completo: nomeCompleto,
          biografia_curta: biografiaCurta,
          perfil_publico: perfilPublico,
          mostrar_email: mostrarEmail,
          analise_uso: analiseUso,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (configError) throw configError;

      // 2. Atualizar Senha se preenchida
      if (novaSenha) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: novaSenha
        });
        if (passwordError) throw passwordError;
        setSenhaAtual('');
        setNovaSenha('');
      }

      alert('Configurações salvas com sucesso!');
    } catch (err: any) {
      alert(`Erro ao salvar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const discardChanges = () => {
    if (confirm('Deseja descartar as alterações não salvas?')) {
      fetchUserData();
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Carregando Perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex font-['Inter',_sans-serif] antialiased">
      <Sidebar />

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <header className="h-20 w-full bg-white/70 backdrop-blur-xl border-b border-slate-100/80 flex items-center px-8 md:px-12 justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Home</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Configurações</span>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="text-right">
                <p className="text-xs font-black text-slate-900 uppercase tracking-tight leading-none">{nomeCompleto || 'Marlon Sales'}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Master Broker</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-indigo-200 transition-all">
                <Icons.Users />
              </div>
            </div>
          </div>
        </header>

        <main className="p-8 md:p-12 max-w-[1200px] mx-auto w-full space-y-12 animate-in fade-in duration-700">
          
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-4xl md:text-5xl font-black text-slate-950 uppercase tracking-tighter leading-[0.85]">
                Ajustes do <span className="text-slate-300">Sistema</span>
              </h2>
              <p className="text-slate-500 text-sm font-medium tracking-tight">
                Gerencie suas informações pessoais, segurança da conta e preferências de notificação.
              </p>
            </div>

            <div className="flex gap-2 p-1.5 bg-slate-100/50 rounded-[2rem] w-fit border border-slate-100">
              {[
                { id: 'perfil', label: 'Meu Perfil' },
                { id: 'seguranca', label: 'Segurança' },
                { id: 'notificacoes', label: 'Notificações' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                    activeTab === tab.id 
                      ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            <div className="lg:col-span-8 space-y-8">
              
              <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-10 space-y-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Informações Pessoais</h3>
                  <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Icons.Users />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                    <input 
                      type="text" 
                      id="nome_completo"
                      name="nome_completo"
                      value={nomeCompleto}
                      onChange={(e) => setNomeCompleto(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Profissional</label>
                    <input 
                      type="email" 
                      id="email_profissional"
                      name="email_profissional"
                      readOnly
                      value={emailProfissional}
                      className="w-full px-6 py-4 bg-slate-100 border border-slate-100 rounded-2xl text-xs font-bold text-slate-400 outline-none cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-3 md:col-span-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Biografia Curta</label>
                    <textarea 
                      id="biografia_curta"
                      name="biografia_curta"
                      rows={4}
                      value={biografiaCurta}
                      onChange={(e) => setBiografiaCurta(e.target.value)}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-200 transition-all resize-none"
                      placeholder="Especialista em mercado imobiliário de luxo..."
                    />
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-10 space-y-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Segurança da Conta</h3>
                  <div className="w-8 h-8 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                    <Icons.Settings />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha Atual</label>
                    <input 
                      type="password" 
                      id="senha_atual"
                      name="senha_atual"
                      value={senhaAtual}
                      onChange={(e) => setSenhaAtual(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-200 transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nova Senha</label>
                    <input 
                      type="password" 
                      id="nova_senha"
                      name="nova_senha"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-200 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Autenticação em Duas Etapas</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aumente a proteção da sua conta</p>
                  </div>
                  <button type="button" className="px-5 py-2.5 bg-slate-950 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-600 transition-all">
                    Ativar 2FA
                  </button>
                </div>
              </section>

              <div className="flex items-center justify-end gap-4 pt-4">
                <button 
                  type="button"
                  onClick={discardChanges}
                  className="px-8 py-4 bg-white border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:text-slate-600 transition-all"
                >
                  Descartar Alterações
                </button>
                <button 
                  type="button"
                  disabled={loading}
                  onClick={handleSave}
                  className="px-10 py-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Salvar Configurações'}
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
              
              <div className="bg-slate-950 rounded-[3rem] p-10 text-white text-center space-y-8 shadow-2xl shadow-slate-200">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-500 mx-auto flex items-center justify-center text-4xl font-black border-4 border-white/10 uppercase">
                    {nomeCompleto ? nomeCompleto.substring(0, 2) : 'MS'}
                  </div>
                  <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white text-slate-950 rounded-2xl border-4 border-slate-950 flex items-center justify-center hover:bg-indigo-50 transition-colors shadow-xl">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812-1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  </button>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xl font-black uppercase tracking-tighter line-clamp-1">{nomeCompleto || 'Marlon Sales'}</h4>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Master Broker</p>
                </div>

                <div className="pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Status</p>
                    <p className="text-xs font-black uppercase tracking-tight mt-1">Verificado</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Desde</p>
                    <p className="text-xs font-black uppercase tracking-tight mt-1">Jan 2024</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-6">
                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Privacidade dos Dados</h3>
                <div className="space-y-4">
                  {[
                    { id: 'perfil_publico', label: 'Perfil Público', active: perfilPublico, setter: setPerfilPublico },
                    { id: 'mostrar_email', label: 'Mostrar E-mail', active: mostrarEmail, setter: setMostrarEmail },
                    { id: 'analise_uso', label: 'Análise de Uso', active: analiseUso, setter: setAnaliseUso }
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{item.label}</span>
                      <div 
                        id={item.id}
                        data-active={item.active}
                        onClick={() => item.setter(!item.active)}
                        className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${item.active ? 'bg-indigo-600' : 'bg-slate-200'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${item.active ? 'right-1' : 'left-1'}`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Configuracoes;
