import React from 'react';
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Radar,
  Bot,
  Store,
  Key
} from 'lucide-react';

interface StepCompleteProps {
  sellerName: string;
  category: string;
  firstMlb: string;
  tone: string;
  onFinish: () => void;
  isSaving: boolean;
}

export const StepComplete: React.FC<StepCompleteProps> = ({
  sellerName,
  category,
  firstMlb,
  tone,
  onFinish,
  isSaving,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Info */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mb-1 shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">
          Tudo Pronto para Escalar suas Vendas!
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Sua conta do Mercado Livre está conectada e as ferramentas de inteligência estão calibradas para o seu negócio.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Account Summary */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
            <Store className="w-4 h-4 text-blue-600" />
            <span>Conta Vinculada</span>
          </div>
          <div className="text-xs space-y-1 text-slate-600">
            <p><strong>Vendedor:</strong> <span className="text-slate-900">{sellerName || 'Vendedor Oficial'}</span></p>
            <p><strong>País:</strong> Brasil (MLB)</p>
            <p><strong>Status:</strong> <span className="text-emerald-600 font-bold">100% Read-Only Conectado</span></p>
          </div>
        </div>

        {/* Radar Summary */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
            <Radar className="w-4 h-4 text-blue-600" />
            <span>Radar de Concorrência</span>
          </div>
          <div className="text-xs space-y-1 text-slate-600">
            <p><strong>Segmento:</strong> {category || 'Geral'}</p>
            <p><strong>1º Concorrente:</strong> {firstMlb || 'Ativado no Radar'}</p>
            <p><strong>Varredura:</strong> Automática</p>
          </div>
        </div>

        {/* AI Copilot Summary */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-xs space-y-2.5 sm:col-span-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
            <Bot className="w-4 h-4 text-blue-600" />
            <span>Copilot de Pré-Vendas (IA)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
            <p><strong>Tom de Voz:</strong> <span className="capitalize">{tone}</span></p>
            <p><strong>Modo de Operação:</strong> 1-Clique Copiar & Colar</p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={onFinish}
          disabled={isSaving}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 text-white font-extrabold text-sm px-8 py-3.5 rounded-2xl shadow-md shadow-blue-500/20 transition transform active:scale-98"
        >
          {isSaving ? (
            <span className="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Acessar o Dashboard Mercado Livre Intelligence</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
