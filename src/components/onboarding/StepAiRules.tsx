import React from 'react';
import {
  Bot,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  ShieldCheck,
  Copy
} from 'lucide-react';
import { AiToneOfVoice } from '../../types/settings';

interface StepAiRulesProps {
  tone: AiToneOfVoice;
  onToneChange: (tone: AiToneOfVoice) => void;
  greeting: string;
  onGreetingChange: (greeting: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export const StepAiRules: React.FC<StepAiRulesProps> = ({
  tone,
  onToneChange,
  greeting,
  onGreetingChange,
  onBack,
  onNext,
}) => {
  const tones: { id: AiToneOfVoice; label: string; desc: string; sample: string }[] = [
    {
      id: 'commercial',
      label: 'Comercial & Focado em Fechamento (Recomendado)',
      desc: 'Respostas persuasivas destacando pronta entrega Full e nota fiscal.',
      sample: 'Olá! Sim, temos estoque à pronta entrega com envio imediato pelo Full e nota fiscal inclusa. Aguardamos sua compra!',
    },
    {
      id: 'formal',
      label: 'Formal & Corporativo',
      desc: 'Linguagem polida, profissional e direta.',
      sample: 'Prezado cliente, informamos que o produto encontra-se disponível para despacho imediato com garantia oficial.',
    },
    {
      id: 'technical',
      label: 'Altamente Técnico',
      desc: 'Foco em compatibilidade, especificações técnicas e pinagem.',
      sample: 'Olá! O modelo opera em 110/220V bivolt automático com taxa de amostragem de 24-bit/96kHz e barramento USB-C.',
    },
    {
      id: 'enthusiastic',
      label: 'Entusiasmado & Amigável',
      desc: 'Atendimento acolhedor com simpatia e dinamismo.',
      sample: 'Olá, tudo bem? Sim, é perfeito para você! Enviamos super rápido pelo Full para chegar voando aí!',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Info */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 mb-1">
          <Bot className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Etapa 3: Calibrar o Copilot de Pré-Vendas com IA
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Escolha como o assistente deve formular as respostas para você copiar e colar rapidamente no Mercado Livre.
        </p>
      </div>

      {/* Read-Only Notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Copy className="w-4 h-4 text-blue-600 shrink-0" />
          <span><strong>Modo Copilot:</strong> A IA redige o texto ideal para você copiar com 1 clique e colar no seu painel.</span>
        </div>
        <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
          1-Clique
        </span>
      </div>

      {/* Tone Selection */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Tom de Voz Padrão:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tones.map((t) => (
            <div
              key={t.id}
              onClick={() => onToneChange(t.id)}
              className={`p-4 rounded-xl border cursor-pointer transition ${
                tone === t.id
                  ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}
            >
              <div className="flex justify-between items-center font-bold text-slate-900 text-xs">
                <span>{t.label}</span>
                {tone === t.id && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{t.desc}</p>
              <div className="mt-2.5 p-2 bg-white/80 border border-slate-200/60 rounded-lg text-[10px] text-slate-600 italic">
                "{t.sample}"
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Greeting */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Saudação Inicial Personalizada
        </label>
        <input
          type="text"
          value={greeting}
          onChange={(e) => onGreetingChange(e.target.value)}
          placeholder="Ex: Olá! Agradecemos seu contato e ficamos felizes em ajudar."
          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
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
          <span>Avançar para o Resumo Final</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
