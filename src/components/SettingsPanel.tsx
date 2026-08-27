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
  Bell,
  Check
} from 'lucide-react';
import {
  AppSettings,
  DEFAULT_SETTINGS,
  MlApiSettings,
  RadarSettings,
  EstimatorSettings,
  PreSalesSettings,
  AiToneOfVoice,
  AiApprovalRule
} from '../types/settings';

export type SettingsTab = 'api' | 'radar' | 'estimator' | 'pre-sales';

interface SettingsPanelProps {
  initialTab?: SettingsTab;
  onTabChange?: (tab: SettingsTab) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  initialTab = 'api',
  onTabChange
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [newMlb, setNewMlb] = useState('');
  const [newSeller, setNewSeller] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const handleTabClick = (tab: SettingsTab) => {
    setActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const handleSave = () => {
    setSaveMessage('Configurações salvas com sucesso!');
    setTimeout(() => {
      setSaveMessage(null);
    }, 3000);
  };

  const handleTestToken = () => {
    setTestingConnection(true);
    setTimeout(() => {
      setTestingConnection(false);
      const isAppUsr = settings.api.accessToken.trim().startsWith('APP_USR-');
      setSettings((prev) => ({
        ...prev,
        api: {
          ...prev.api,
          connectionStatus: isAppUsr ? 'connected' : 'expired',
          lastTestedAt: new Date().toISOString(),
        },
      }));
    }, 1000);
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

    setSettings((prev) => ({
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
    setSettings((prev) => ({
      ...prev,
      radar: {
        ...prev.radar,
        monitoredCompetitors: prev.radar.monitoredCompetitors.filter((item) => item.id !== id),
      },
    }));
  };

  const handleMultiplierChange = (categoryKey: string, val: number) => {
    setSettings((prev) => ({
      ...prev,
      estimator: {
        ...prev.estimator,
        categoryMultipliers: prev.estimator.categoryMultipliers.map((cat) =>
          cat.categoryKey === categoryKey ? { ...cat, multiplier: val } : cat
        ),
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-6 h-6 text-blue-600" />
            Configurações do Mercado Livre Intelligence
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie credenciais de API, frequência de varredura do radar, parâmetros estocásticos e assistente IA.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-xs transition-colors gap-2 self-start md:self-auto cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Alterações</span>
        </button>
      </div>

      {saveMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 overflow-x-auto">
        <button
          onClick={() => handleTabClick('api')}
          className={`flex items-center gap-2 py-3 px-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'api'
              ? 'border-blue-600 text-blue-600 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Mercado Livre API</span>
        </button>

        <button
          onClick={() => handleTabClick('radar')}
          className={`flex items-center gap-2 py-3 px-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'radar'
              ? 'border-blue-600 text-blue-600 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Radar className="w-4 h-4" />
          <span>Radar & Buy Box</span>
        </button>

        <button
          onClick={() => handleTabClick('estimator')}
          className={`flex items-center gap-2 py-3 px-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'estimator'
              ? 'border-blue-600 text-blue-600 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Estimador de Vendas</span>
        </button>

        <button
          onClick={() => handleTabClick('pre-sales')}
          className={`flex items-center gap-2 py-3 px-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'pre-sales'
              ? 'border-blue-600 text-blue-600 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Pré-Vendas IA</span>
        </button>
      </div>

      {/* TAB 1: API Credentials */}
      {activeTab === 'api' && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-600" />
              Credenciais da API do Mercado Livre
            </h3>
            <p className="text-sm text-slate-600">
              Insira o Access Token da sua conta do Mercado Livre para habilitar as integrações diretas de catálogo, histórico de anúncios e métricas de vendas.
            </p>

            {/* Token Input field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Access Token (`APP_USR-...`)
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="password"
                  value={settings.api.accessToken}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      api: { ...prev.api, accessToken: e.target.value },
                    }))
                  }
                  placeholder="APP_USR-1234567890..."
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleTestToken}
                  disabled={testingConnection}
                  className="inline-flex items-center justify-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${testingConnection ? 'animate-spin' : ''}`} />
                  <span>{testingConnection ? 'Testando...' : 'Testar Conexão'}</span>
                </button>
              </div>
            </div>

            {/* Connection Status Badge */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <div className="text-sm font-medium text-slate-700">Status da Conexão:</div>
              {settings.api.connectionStatus === 'connected' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Conectado (API ML Ativa)
                </span>
              )}
              {settings.api.connectionStatus === 'expired' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Token Expirado ou Inválido
                </span>
              )}
              {settings.api.connectionStatus === 'simulation' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Modo Simulação Demo
                </span>
              )}

              {settings.api.lastTestedAt && (
                <span className="text-xs text-slate-500">
                  Última verificação: {new Date(settings.api.lastTestedAt).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Safe Read-Only Mode Indicator */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-700">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                    Modo Leitura Segura (Safe Read-Only)
                    <span className="bg-emerald-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-md">
                      Ativo
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Garantia de segurança: Zero permissões de alteração de preços acidental, 100% focado em inteligência, radar e analytics.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600 pt-2">
              <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Sem escrita em preços</span>
              </div>
              <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Sem edições em anúncios</span>
              </div>
              <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Apenas consumo de dados</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Radar & Buy Box */}
      {activeTab === 'radar' && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Radar className="w-5 h-5 text-blue-600" />
              Parâmetros do Radar de Concorrência & Buy Box
            </h3>
            <p className="text-sm text-slate-600">
              Ajuste o intervalo de varredura automática, a sensibilidade dos alertas de variação de preço dos concorrentes e os anúncios monitorados.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Scan Interval */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-sm font-semibold text-slate-900">
                  Intervalo de Varredura Automática
                </label>
                <p className="text-xs text-slate-500">
                  Frequência com que o radar coleta o preço, estoque e Buy Box dos anúncios monitorados.
                </p>
                <select
                  value={settings.radar.scanInterval}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      radar: {
                        ...prev.radar,
                        scanInterval: e.target.value as '15m' | '1h' | '6h',
                      },
                    }))
                  }
                  className="w-full mt-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="15m">A cada 15 minutos (Alta frequência)</option>
                  <option value="1h">A cada 1 hora (Recomendado)</option>
                  <option value="6h">A cada 6 horas (Economia de requisições)</option>
                </select>
              </div>

              {/* Sensitivity Margin */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-sm font-semibold text-slate-900">
                  Margem de Sensibilidade do Alerta Buy Box
                </label>
                <p className="text-xs text-slate-500">
                  Variação percentual mínima do concorrente para disparar notificação de risco no painel.
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="number"
                    min="0.5"
                    max="20"
                    step="0.5"
                    value={settings.radar.buyBoxSensitivityMarginPercent}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        radar: {
                          ...prev.radar,
                          buyBoxSensitivityMarginPercent: parseFloat(e.target.value) || 0,
                        },
                      }))
                    }
                    className="w-28 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700">% de diferença</span>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Monitored Competitors list & Add Form */}
          <div className="space-y-4">
            <h4 className="text-md font-bold text-slate-900 flex items-center justify-between">
              <span>Sellers & MLBs Monitorados Diretos ({settings.radar.monitoredCompetitors.length})</span>
            </h4>

            {/* Add competitor form */}
            <form onSubmit={handleAddCompetitor} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                Adicionar Novo Concorrente ao Radar
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Código MLB (ex: MLB3849102834)"
                  value={newMlb}
                  onChange={(e) => setNewMlb(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Nickname do Seller (ex: TECH_STORE)"
                  value={newSeller}
                  onChange={(e) => setNewSeller(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Observação (opcional)"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar ao Radar</span>
              </button>
            </form>

            {/* Competitor List Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-100 text-xs uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold">MLB ID</th>
                    <th className="px-4 py-3 font-semibold">Seller Nickname</th>
                    <th className="px-4 py-3 font-semibold">Notas / Contexto</th>
                    <th className="px-4 py-3 font-semibold text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {settings.radar.monitoredCompetitors.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-slate-900 font-semibold">{item.mlbId}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{item.sellerNickname}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{item.notes || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleRemoveCompetitor(item.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remover concorrente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {settings.radar.monitoredCompetitors.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500 text-sm">
                        Nenhum concorrente cadastrado no radar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Sales Estimator */}
      {activeTab === 'estimator' && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Configurações do Estimador de Vendas Estocástico
            </h3>
            <p className="text-sm text-slate-600">
              Ajuste fino dos multiplicadores estocásticos por categoria de produtos e selecione a margem de confiança estatística do algoritmo Zipf/Bayesiano.
            </p>

            {/* Confidence Margin Selection */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <label className="block text-sm font-semibold text-slate-900">
                Margem de Confiança Estatística
              </label>
              <p className="text-xs text-slate-500">
                Determina o intervalo de tolerância para cálculo do volume estocástico mensal.
              </p>
              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-800">
                  <input
                    type="radio"
                    name="confidence"
                    value="80"
                    checked={settings.estimator.confidenceMargin === '80'}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        estimator: {
                          ...prev.estimator,
                          confidenceMargin: e.target.value as '80' | '95',
                        },
                      }))
                    }
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>80% Intervalo de Confiança</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-800">
                  <input
                    type="radio"
                    name="confidence"
                    value="95"
                    checked={settings.estimator.confidenceMargin === '95'}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        estimator: {
                          ...prev.estimator,
                          confidenceMargin: e.target.value as '80' | '95',
                        },
                      }))
                    }
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>95% Intervalo de Confiança (Recomendado)</span>
                </label>
              </div>
            </div>

            {/* Category Multipliers */}
            <div className="space-y-4 pt-2">
              <h4 className="text-md font-bold text-slate-900">
                Multiplicadores Estocásticos por Categoria
              </h4>
              <p className="text-xs text-slate-500">
                Valores acima de 1.0 aumentam a sensibilidade estimada de vendas para categorias de alta rotatividade.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {settings.estimator.categoryMultipliers.map((cat) => (
                  <div key={cat.categoryKey} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-sm">{cat.categoryName}</span>
                      <span className="font-mono text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                        {cat.multiplier.toFixed(2)}x
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.05"
                        value={cat.multiplier}
                        onChange={(e) =>
                          handleMultiplierChange(cat.categoryKey, parseFloat(e.target.value))
                        }
                        className="flex-1 accent-blue-600"
                      />
                      <input
                        type="number"
                        min="0.5"
                        max="2.0"
                        step="0.05"
                        value={cat.multiplier}
                        onChange={(e) =>
                          handleMultiplierChange(cat.categoryKey, parseFloat(e.target.value) || 1.0)
                        }
                        className="w-20 px-2 py-1 text-xs font-mono bg-white border border-slate-300 rounded-md text-slate-800"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Pre-Sales AI Copilot */}
      {activeTab === 'pre-sales' && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-600" />
              Assistente de Pré-Vendas com Inteligência Artificial
            </h3>
            <p className="text-sm text-slate-600">
              Defina as diretrizes comportamentais e o tom de voz do copiloto de IA para responder dúvidas pré-venda de compradores.
            </p>

            {/* Tone of Voice Selection */}
            <div className="space-y-3 pt-2">
              <label className="block text-sm font-semibold text-slate-900">
                Tom de Voz Padrão das Respostas Sugeridas
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: 'formal', label: 'Formal', desc: 'Respostas diretas, altamente educadas e institucionais.' },
                  { id: 'enthusiastic', label: 'Entusiasmado', desc: 'Tom caloroso, com emojis e alto engajamento de vendas.' },
                  { id: 'technical', label: 'Técnico', desc: 'Foco em especificações detalhadas, compatibilidade e especificações.' },
                  { id: 'commercial', label: 'Comercial', desc: 'Foco em conversão imediata, gatilhos de estoque e cupom.' },
                ].map((tone) => (
                  <div
                    key={tone.id}
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        preSales: { ...prev.preSales, defaultTone: tone.id as AiToneOfVoice },
                      }))
                    }
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      settings.preSales.defaultTone === tone.id
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-900 text-sm">{tone.label}</span>
                      {settings.preSales.defaultTone === tone.id && (
                        <Check className="w-4 h-4 text-blue-600 font-bold" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{tone.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* Approval Rules */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-900">
                Regra de Envio de Respostas
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  onClick={() =>
                    setSettings((prev) => ({
                      ...prev,
                      preSales: { ...prev.preSales, approvalRule: 'manual_approval' },
                    }))
                  }
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    settings.preSales.approvalRule === 'manual_approval'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-900 text-sm">
                      Aprovação Manual Obrigatória
                    </span>
                    {settings.preSales.approvalRule === 'manual_approval' && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    A IA gera o rascunho de resposta e o operador humano deve revisar/editar antes de enviar ao comprador.
                  </p>
                </div>

                <div
                  onClick={() =>
                    setSettings((prev) => ({
                      ...prev,
                      preSales: { ...prev.preSales, approvalRule: 'one_click_suggestion' },
                    }))
                  }
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    settings.preSales.approvalRule === 'one_click_suggestion'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-900 text-sm">
                      Sugestão com 1-Click
                    </span>
                    {settings.preSales.approvalRule === 'one_click_suggestion' && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Exibe botão de envio instantâneo com 1 clique direto na caixa de entrada do vendedor.
                  </p>
                </div>
              </div>
            </div>

            {/* Custom Greeting */}
            <div className="space-y-2 pt-2">
              <label className="block text-sm font-semibold text-slate-900">
                Saudação Personalizada Padrão
              </label>
              <input
                type="text"
                value={settings.preSales.customGreeting || ''}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    preSales: { ...prev.preSales, customGreeting: e.target.value },
                  }))
                }
                placeholder="Ex: Olá! Agradecemos sua pergunta."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
