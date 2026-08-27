import React from 'react';
import {
  Key,
  ShieldCheck,
  Zap,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Store,
  ArrowRight,
  Info
} from 'lucide-react';
import { ValidateTokenResult } from '../../services/mlApi';

interface StepApiKeyProps {
  token: string;
  onTokenChange: (token: string) => void;
  onValidate: () => Promise<boolean>;
  isTesting: boolean;
  validationResult: ValidateTokenResult | null;
  onUseDemo: () => void;
  onNext: () => void;
}

export const StepApiKey: React.FC<StepApiKeyProps> = ({
  token,
  onTokenChange,
  onValidate,
  isTesting,
  validationResult,
  onUseDemo,
  onNext,
  const isConnected = validationResult?.valid === true || token.startsWith('SIMULATION_') || (token.startsWith('APP_USR-') && validationResult?.valid !== false);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Info */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 mb-1">
          <Key className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Etapa 1: Conectar sua Chave de API do Mercado Livre
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Conecte sua conta para carregar seus produtos, monitorar concorrentes e gerar respostas com inteligência artificial.
        </p>
      </div>

      {/* Security Read-Only Pill */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-900">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span><strong>100% Read-Only (Somente-Leitura):</strong> Sem risco de alterações na sua conta.</span>
        </div>
        <span className="bg-emerald-200 text-emerald-950 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
          Seguro
        </span>
      </div>

      {/* Input Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Mercado Libre Access Token
          </label>
          <div className="relative">
            <input
              type="password"
              value={token}
              onChange={(e) => onTokenChange(e.target.value)}
              placeholder="Cole seu token aqui (APP_USR-...)"
              className="w-full pl-3.5 pr-20 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.readText().then((txt) => onTokenChange(txt.trim())).catch(() => {});
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:text-blue-600 transition"
            >
              Colar
            </button>
          </div>
        </div>

        {/* Validation Button & Quick Demo */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={onValidate}
            disabled={isTesting || !token.trim()}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Validando na API do ML...' : 'Testar e Validar Chave'}</span>
          </button>

          <button
            type="button"
            onClick={onUseDemo}
            className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Quero testar com dados de Demonstração</span>
          </button>
        </div>

        {/* Validation Result Box */}
        {validationResult && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 border ${
              validationResult.valid
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {validationResult.valid ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <span className="font-semibold block">
                {validationResult.valid
                  ? 'Chave conectada com sucesso!'
                  : 'Falha na validação'}
              </span>
              <p className="text-[11px] leading-relaxed">
                {validationResult.valid
                  ? `Vendedor: ${validationResult.accountInfo?.nickname || 'Oficial'} · Reputação: ${validationResult.accountInfo?.reputationLevel || 'Platinum'}`
                  : validationResult.errorMessage || 'Verifique se o token não expirou.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Guide Help Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2 text-slate-600">
        <span className="font-bold text-slate-800 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-600" />
          Como obter sua chave de API no Mercado Livre:
        </span>
        <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed pl-1">
          <li>Acesse o <a href="https://developers.mercadolivre.com.br" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold inline-flex items-center gap-0.5">Mercado Livre Developers <ExternalLink className="w-2.5 h-2.5" /></a> com sua conta de vendedor.</li>
          <li>Em <em>Minhas Aplicações</em>, crie ou selecione sua aplicação.</li>
          <li>Gere o <strong>Access Token</strong> de leitura e cole no campo acima.</li>
        </ol>
      </div>

      {/* Footer Navigation */}
<<<<<<< HEAD
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onNext}
          disabled={!isConnected}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-xs transition transform active:scale-95"
        >
          <span>Avançar para o Radar de Concorrência</span>
          <ArrowRight className="w-4 h-4" />
        </button>
=======
      <div className="flex items-center justify-between pt-2">
        {!isConnected && (
          <span className="text-xs text-amber-700 font-medium bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
            * É necessário testar e validar a chave de API para avançar.
          </span>
        )}
        <div className="ml-auto">
          <button
            type="button"
            onClick={onNext}
            disabled={!isConnected}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs px-6 py-3 rounded-xl shadow-xs transition transform active:scale-95"
          >
            <span>Avançar para o Radar de Concorrência</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
>>>>>>> feat-onboarding-gating
      </div>
    </div>
  );
};
