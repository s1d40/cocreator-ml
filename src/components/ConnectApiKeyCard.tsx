import React, { useState } from 'react';
import Link from 'next/link';
import { Key, ShieldCheck, RefreshCw, Zap, AlertTriangle, CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { ValidateTokenResult } from '../services/mlApi';

export const ConnectApiKeyCard: React.FC = () => {
  const { settings, testApiKey, isTesting } = useSettings();
  const [tokenInput, setTokenInput] = useState(settings.api.accessToken || '');
  const [validationResult, setValidationResult] = useState<ValidateTokenResult | null>(null);

  const handleValidate = async () => {
    if (!tokenInput.trim()) return;
    const res = await testApiKey(tokenInput.trim());
    setValidationResult(res);
  };

  const handleUseDemo = async () => {
    const demoToken = 'SIMULATION_ML_ACCESS_TOKEN_' + Date.now();
    setTokenInput(demoToken);
    const res = await testApiKey(demoToken);
    setValidationResult(res);
  };

  return (
    <div className="max-w-3xl mx-auto my-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
          <Key className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          Conecte sua Chave de API do Mercado Livre
        </h2>
        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Para acessar as métricas em tempo real, radar de concorrência, assistente de dúvidas com IA e estimador de vendas, insira sua chave da API oficial Mercado Livre.
        </p>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-900">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            <strong>Conexão 100% Segura & Read-Only (Somente-Leitura):</strong> O aplicativo apenas lê os dados da sua loja sem realizar alterações de catálogo ou preços.
          </span>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Mercado Libre Access Token
          </label>
          <div className="relative">
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => {
                setTokenInput(e.target.value);
                if (validationResult) setValidationResult(null);
              }}
              placeholder="Cole seu Access Token aqui (APP_USR-...)"
              className="w-full pl-3.5 pr-20 py-3 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.readText().then((txt) => setTokenInput(txt.trim())).catch(() => {});
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 transition"
            >
              Colar
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={handleValidate}
            disabled={isTesting || !tokenInput.trim()}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition"
          >
            <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Validando na API do ML...' : 'Testar e Conectar Chave'}</span>
          </button>

          <button
            type="button"
            onClick={handleUseDemo}
            className="text-xs text-amber-800 font-semibold flex items-center gap-1.5 px-4 py-2.5 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition"
          >
            <Zap className="w-4 h-4 text-amber-600" />
            <span>Testar com Modo Demonstração</span>
          </button>
        </div>

        {validationResult && (
          <div
            className={`p-4 rounded-xl text-xs flex items-start gap-3 border ${
              validationResult.valid
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {validationResult.valid ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <span className="font-bold text-sm block">
                {validationResult.valid ? 'Chave de API Conectada!' : 'Falha na Conexão'}
              </span>
              <p className="text-xs leading-relaxed">
                {validationResult.valid
                  ? `Vendedor: ${validationResult.accountInfo?.nickname || 'Oficial ML'} · ID: ${validationResult.accountInfo?.id || 'OK'}`
                  : validationResult.errorMessage || 'Verifique se o token é válido.'}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
        <div className="text-xs text-slate-500">
          Não sabe como gerar seu Access Token?
        </div>
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
        >
          <span>Abrir Assistente de Configuração Completo</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
