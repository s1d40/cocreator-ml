import React, { useState } from 'react';
import {
  Key,
  ShieldCheck,
  Radar,
  TrendingUp,
  Bot,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
  Save,
  Lock,
  Sliders,
  Sparkles,
  ExternalLink,
  Store,
  Check,
  Zap,
  Info
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { SettingsTab } from '../types/settings';

interface SettingsPanelProps {
  initialTab?: 'api' | 'radar' | 'estimator' | 'pre-sales';
  onTabChange?: (tab: 'api' | 'radar' | 'estimator' | 'pre-sales') => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  initialTab = 'api',
  onTabChange,
}) => {
  const { settings, updateSettings, saveSettings, testApiKey, isTesting, activeSeller } = useSettings();
  const [activeTab, setActiveTab] = useState<'api' | 'radar' | 'estimator' | 'pre-sales'>(initialTab);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [inputToken, setInputToken] = useState(settings.api.accessToken || '');
  const [testResultMsg, setTestResultMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [newMlb, setNewMlb] = useState('');
  const [newSeller, setNewSeller] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const handleTabClick = (tab: 'api' | 'radar' | 'estimator' | 'pre-sales') => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const handleSave = () => {
    updateSettings((prev) => ({
      ...prev,
      api: {
        ...prev.api,
        accessToken: inputToken.trim(),
      },
    }));
    saveSettings();
    setSaveMessage('Configurações e Chave de API salvas com sucesso!');
    setTimeout(() => setSaveMessage(null), 3500);
  };

  const handleTestToken = async () => {
    setTestResultMsg(null);
    const result = await testApiKey(inputToken.trim());
    if (result.valid) {
      setTestResultMsg({
        type: 'success',
        text: `Conexão bem-sucedida! Conta conectada: ${result.accountInfo?.nickname || 'Vendedor Oficial'} (ID: ${result.accountInfo?.id || 'OK'})`,
      });
    } else {
      setTestResultMsg({
        type: 'error',
        text: result.errorMessage || 'Falha ao validar a chave de API no Mercado Livre.',
      });
    }
  };

  const handleUseDemoKey = () => {
    const demoToken = 'SIMULATION_ML_ACCESS_TOKEN_' + Date.now();
    setInputToken(demoToken);
    updateSettings((prev) => ({
      ...prev,
      api: {
        ...prev.api,
        accessToken: demoToken,
        connectionStatus: 'simulation',
      },
    }));
    testApiKey(demoToken);
  };

  const handleAddCompetitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMlb.trim() || !newSeller.trim()) return;

    const newItem = {
      id: Date.now().toString(),
      mlbId: newMlb.trim().toUpperCase(),
      sellerNickname: newSeller.trim().toUpperCase(),
      notes: newNotes.trim(),
    };

    updateSettings((prev) => ({
      ...prev,
      radar: {
        ...prev.radar,
        monitoredCompetitors: [...prev.radar.monitoredCompetitors, newItem],
      },
    }));

    setNewMlb('');
    setNewSeller('');
    setNewNotes('');
  };

  const handleRemoveCompetitor = (id: string) => {
    updateSettings((prev) => ({
      ...prev,
      radar: {
        ...prev.radar,
        monitoredCompetitors: prev.radar.monitoredCompetitors.filter((item) => item.id !== id),
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-blue-600" />
            Configurações & Chaves de API do Mercado Livre
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Insira sua chave de acesso (Access Token) do Mercado Livre para operar com dados reais da sua conta ou concorrentes.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-xs transition transform active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Todas as Configurações</span>
        </button>
      </div>

      {/* Save Toast Notification */}
      {saveMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 text-sm shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium">{saveMessage}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button
          onClick={() => handleTabClick('api')}
          className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'api'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Chave de API & Conexão</span>
          {settings.api.connectionStatus === 'connected' && (
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          )}
        </button>

        <button
          onClick={() => handleTabClick('radar')}
          className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'radar'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Radar className="w-4 h-4" />
          <span>Radar & Buy Box</span>
        </button>

        <button
          onClick={() => handleTabClick('estimator')}
          className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'estimator'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Estimador Estocástico</span>
        </button>

        <button
          onClick={() => handleTabClick('pre-sales')}
          className={`pb-3 px-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'pre-sales'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>IA Pré-Vendas</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: API CREDENTIALS & TOKEN MANAGEMENT                              */}
      {/* ========================================================================= */}
      {activeTab === 'api' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Key className="w-5 h-5 text-blue-600" />
                    Chave de Acesso da API (Access Token)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Cole o token gerado no Developer Hub do Mercado Livre (`APP_USR-...`)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleUseDemoKey}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span>Usar Chave de Demonstração</span>
                </button>
              </div>

              {/* Token Input Field */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Mercado Libre Access Token
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={inputToken}
                    onChange={(e) => setInputToken(e.target.value)}
                    placeholder="Cole seu token aqui: APP_USR-xxxxxx-xxxxxx-..."
                    className="w-full pl-3.5 pr-10 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.readText().then((txt) => setInputToken(txt.trim())).catch(() => {});
                    }}
                    title="Colar da Área de Transferência"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-600 hover:text-blue-600 shadow-2xs"
                  >
                    Colar
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  O token é armazenado com segurança no seu ambiente e utilizado para sincronizar dados ao vivo.
                </p>
              </div>

              {/* Test & Activation Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestToken}
                    disabled={isTesting || !inputToken.trim()}
                    className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>{isTesting ? 'Validando na API do ML...' : 'Testar e Validar Chave'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">Modo Somente-Leitura:</span>
                  <button
                    type="button"
                    onClick={() =>
                      updateSettings((prev) => ({
                        ...prev,
                        api: { ...prev.api, readOnlyMode: !prev.api.readOnlyMode },
                      }))
                    }
                    className={`px-3 py-1 rounded-full font-bold text-xs transition ${
                      settings.api.readOnlyMode
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    {settings.api.readOnlyMode ? 'Ativado (Seguro)' : 'Leitura & Escrita'}
                  </button>
                </div>
              </div>

              {/* Validation Result Alert */}
              {testResultMsg && (
                <div
                  className={`p-4 rounded-xl text-xs flex items-start gap-2.5 border ${
                    testResultMsg.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  {testResultMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span className="font-medium leading-relaxed">{testResultMsg.text}</span>
                </div>
              )}
            </div>

            {/* How to get API Key Card */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                Como obter sua chave de API oficial do Mercado Livre:
              </h4>
              <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1.5 leading-relaxed">
                <li>Acesse o <a href="https://developers.mercadolivre.com.br" target="_blank" rel="noreferrer" className="text-blue-600 font-semibold underline inline-flex items-center gap-0.5">Mercado Livre Developers <ExternalLink className="w-3 h-3" /></a> com sua conta de vendedor.</li>
                <li>Crie ou selecione sua aplicação corporativa em <em>Minhas Aplicações</em>.</li>
                <li>Gere ou renove o seu <strong>Access Token</strong> (com escopos de leitura e vendas).</li>
                <li>Cole o token no campo acima e clique em <strong>Testar e Validar Chave</strong>.</li>
              </ol>
            </div>
          </div>

          {/* Account Status Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Store className="w-4 h-4 text-blue-600" />
                Status da Conta Vinculada
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Status da Conexão:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                      settings.api.connectionStatus === 'connected'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : settings.api.connectionStatus === 'simulation'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {settings.api.connectionStatus === 'connected'
                      ? 'Ao Vivo (Conectado)'
                      : settings.api.connectionStatus === 'simulation'
                      ? 'Modo Simulação'
                      : 'Desconectado / Expirado'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Vendedor:</span>
                  <span className="font-bold text-slate-800">
                    {activeSeller?.nickname || 'Apex Tech Direct'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">ID da Conta:</span>
                  <span className="font-mono text-slate-700">
                    {activeSeller?.id || 'MLB-34910291'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">País / Site:</span>
                  <span className="font-semibold text-slate-800">Brasil (MLB)</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Reputação Oficial:</span>
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded font-bold text-[11px]">
                    MercadoLíder Platinum
                  </span>
                </div>

                {settings.api.lastTestedAt && (
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                    Último teste: {new Date(settings.api.lastTestedAt).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: RADAR & BUY BOX PARAMETERS                                      */}
      {/* ========================================================================= */}
      {activeTab === 'radar' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Radar className="w-5 h-5 text-blue-600" />
              Parâmetros do Radar de Concorrência & Buy Box
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Intervalo de Varredura Automática
                </label>
                <select
                  value={settings.radar.scanInterval}
                  onChange={(e) =>
                    updateSettings((prev) => ({
                      ...prev,
                      radar: { ...prev.radar, scanInterval: e.target.value as any },
                    }))
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="15m">A cada 15 minutos (Alta Frequência)</option>
                  <option value="1h">A cada 1 hora (Recomendado)</option>
                  <option value="6h">A cada 6 horas</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Margem de Sensibilidade do Buy Box (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={settings.radar.buyBoxSensitivityMarginPercent}
                  onChange={(e) =>
                    updateSettings((prev) => ({
                      ...prev,
                      radar: {
                        ...prev.radar,
                        buyBoxSensitivityMarginPercent: parseFloat(e.target.value) || 0,
                      },
                    }))
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Monitored Competitors List */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Concorrentes & MLB IDs Monitorados</h4>

              <form onSubmit={handleAddCompetitor} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="MLB ID (ex: MLB3849102834)"
                  value={newMlb}
                  onChange={(e) => setNewMlb(e.target.value)}
                  className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                />
                <input
                  type="text"
                  placeholder="Nickname do Concorrente"
                  value={newSeller}
                  onChange={(e) => setNewSeller(e.target.value)}
                  className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                />
                <input
                  type="text"
                  placeholder="Anotações / Categoria"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar</span>
                </button>
              </form>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {settings.radar.monitoredCompetitors.map((item) => (
                  <div key={item.id} className="p-3 bg-white flex items-center justify-between text-xs hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {item.mlbId}
                      </span>
                      <span className="font-semibold text-slate-800">{item.sellerNickname}</span>
                      {item.notes && <span className="text-slate-400">({item.notes})</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCompetitor(item.id)}
                      className="text-rose-500 hover:text-rose-700 p-1 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: ESTIMATOR MULTIPLIERS                                           */}
      {/* ========================================================================= */}
      {activeTab === 'estimator' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Multiplicadores & Calibragem do Motor Estocástico
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {settings.estimator.categoryMultipliers.map((cat) => (
                <div key={cat.categoryKey} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800 text-xs">{cat.categoryName}</span>
                    <span className="font-mono font-bold text-blue-600 text-xs">{cat.multiplier.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.05"
                    value={cat.multiplier}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      updateSettings((prev) => ({
                        ...prev,
                        estimator: {
                          ...prev.estimator,
                          categoryMultipliers: prev.estimator.categoryMultipliers.map((c) =>
                            c.categoryKey === cat.categoryKey ? { ...c, multiplier: val } : c
                          ),
                        },
                      }));
                    }}
                    className="w-full accent-blue-600"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 4: PRE-SALES AI RULES                                              */}
      {/* ========================================================================= */}
      {activeTab === 'pre-sales' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-600" />
              Regras & Tom de Voz do Copilot de Pré-Vendas
            </h3>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Tom de Voz das Respostas Automáticas
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'commercial', label: 'Comercial & Focado em Fechamento', desc: 'Respostas persuasivas com gatilhos de urgência e estoque.' },
                  { id: 'formal', label: 'Formal & Corporativo', desc: 'Linguagem polida, profissional e direta.' },
                  { id: 'technical', label: 'Altamente Técnico', desc: 'Foco total em especificações, compatibilidade e pinagem.' },
                  { id: 'enthusiastic', label: 'Entusiasmado & Amigável', desc: 'Atendimento caloroso com emojis e empatia.' },
                ].map((tone) => (
                  <div
                    key={tone.id}
                    onClick={() =>
                      updateSettings((prev) => ({
                        ...prev,
                        preSales: { ...prev.preSales, defaultTone: tone.id as any },
                      }))
                    }
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      settings.preSales.defaultTone === tone.id
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex justify-between items-center font-semibold text-slate-900 text-xs">
                      <span>{tone.label}</span>
                      {settings.preSales.defaultTone === tone.id && <Check className="w-4 h-4 text-blue-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{tone.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Saudação Padrão do Vendedor
              </label>
              <input
                type="text"
                value={settings.preSales.customGreeting || ''}
                onChange={(e) =>
                  updateSettings((prev) => ({
                    ...prev,
                    preSales: { ...prev.preSales, customGreeting: e.target.value },
                  }))
                }
                placeholder="Ex: Olá! Agradecemos sua pergunta e ficamos felizes em ajudar."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
