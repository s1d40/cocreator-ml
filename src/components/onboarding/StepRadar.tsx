import React from 'react';
import {
  Radar,
  ArrowRight,
  ArrowLeft,
  Sliders,
  Store,
  Clock,
  Sparkles
} from 'lucide-react';

interface StepRadarProps {
  category: string;
  onCategoryChange: (cat: string) => void;
  firstMlb: string;
  onFirstMlbChange: (mlb: string) => void;
  firstSeller: string;
  onFirstSellerChange: (seller: string) => void;
  scanInterval: '15m' | '1h' | '6h';
  onScanIntervalChange: (interval: '15m' | '1h' | '6h') => void;
  onBack: () => void;
  onNext: () => void;
}

export const StepRadar: React.FC<StepRadarProps> = ({
  category,
  onCategoryChange,
  firstMlb,
  onFirstMlbChange,
  firstSeller,
  onFirstSellerChange,
  scanInterval,
  onScanIntervalChange,
  onBack,
  onNext,
}) => {
  const categories = [
    { id: 'alimentos', name: 'Alimentos, Bebidas & Gourmet' },
    { id: 'eletronicos', name: 'Eletrônicos, Áudio & Informática' },
    { id: 'moda', name: 'Moda, Calçados & Acessórios' },
    { id: 'casa', name: 'Casa, Decoração & Utilidades' },
    { id: 'beleza', name: 'Beleza & Cuidados Pessoais' },
    { id: 'automotivo', name: 'Acessórios Automotivos' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Info */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 mb-1">
          <Radar className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Etapa 2: Configurar o Radar de Concorrência & Buy Box
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Defina seu segmento principal e adicione seu primeiro concorrente para começar o rastreamento automático de preços.
        </p>
      </div>

      {/* Category Selection */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Selecione o Nicho Principal da sua Loja:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(cat.name)}
              className={`p-3 rounded-xl border text-left text-xs font-semibold transition ${
                category === cat.name
                  ? 'border-blue-600 bg-blue-50/60 text-blue-700 ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* First Competitor */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
          <span>Adicionar 1º Concorrente para Monitorar</span>
          <span className="text-[10px] text-slate-400 font-normal lowercase">(opcional)</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-500">MLB ID do Anúncio Concorrente:</span>
            <input
              type="text"
              value={firstMlb}
              onChange={(e) => onFirstMlbChange(e.target.value)}
              placeholder="Ex: MLB3849102834"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-slate-500">Nome / Loja do Concorrente:</span>
            <input
              type="text"
              value={firstSeller}
              onChange={(e) => onFirstSellerChange(e.target.value)}
              placeholder="Ex: LOJA_RIVAL_OFICIAL"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Scan Interval */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          Frequência de Varredura de Preços
        </label>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {[
            { id: '15m', label: '15 min (Intensa)' },
            { id: '1h', label: '1 hora (Padrão)' },
            { id: '6h', label: '6 horas (Leve)' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onScanIntervalChange(item.id as any)}
              className={`p-2.5 rounded-xl border text-center font-medium transition ${
                scanInterval === item.id
                  ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-between items-center pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-xs transition transform active:scale-95"
        >
          <span>Avançar para o Copilot de IA</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
