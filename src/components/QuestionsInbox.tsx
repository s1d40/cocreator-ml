import React, { useState } from 'react';
import type { Question } from '../data/mockData';
import { ReadOnlyBadge } from './ReadOnlyBadge';
import {
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  Info,
  Send,
  Sparkles,
  Zap,
  Truck,
  ShieldCheck,
  FileText,
  Package,
  Building2,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';

interface QuestionsInboxProps {
  questions: Question[];
}

export function getResponseTimerInfo(createdAtStr: string) {
  const diffMs = Date.now() - new Date(createdAtStr).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 15) {
    return {
      text: `${diffMins} min atrás`,
      urgency: 'low',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      label: 'SLA Ideal (< 15 min)',
    };
  } else if (diffMins < 60) {
    return {
      text: `${diffMins} min atrás`,
      urgency: 'medium',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      label: 'Atenção (< 1h)',
    };
  } else if (diffHours < 24) {
    return {
      text: `${diffHours}h atrás`,
      urgency: 'high',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      label: 'Crítico (> 1h)',
    };
  } else {
    return {
      text: `${diffDays}d atrás`,
      urgency: 'critical',
      badgeClass: 'bg-red-100 text-red-800 border-red-300 font-bold',
      label: 'SLA Estourado',
    };
  }
}

export const QuestionsInbox: React.FC<QuestionsInboxProps> = ({ questions }) => {
  const [questionsList, setQuestionsList] = useState<Question[]>(questions);
  const [filter, setFilter] = useState<'all' | 'unanswered' | 'answered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(questionsList[0] || null);

  const [responseText, setResponseText] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [copied, setCopied] = useState(false);

  const filteredQuestions = questionsList.filter((q) => {
    const matchesFilter = filter === 'all' || q.status === filter;
    const matchesSearch =
      q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.productTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.buyerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  const handleSelectQuestion = (q: Question) => {
    setSelectedQuestion(q);
    setResponseText('');
    setCopied(false);
  };

  const handleGenerateAiResponse = () => {
    if (!selectedQuestion) return;
    setIsGeneratingAi(true);

    setTimeout(() => {
      const qText = selectedQuestion.questionText.toLowerCase();
      const details = selectedQuestion.productDetails;
      let generated = `Olá ${selectedQuestion.buyerName}! Agradecemos sua pergunta. `;

      if (qText.includes('mac') || qText.includes('compat') || qText.includes('funciona')) {
        if (details?.compatibility) {
          generated += `Sim, o ${selectedQuestion.productTitle} possui compatibilidade total com ${details.compatibility}. `;
        } else {
          generated += `Sim, este produto possui ampla compatibilidade Plug & Play nativa. `;
        }
      } else if (qText.includes('cabo') || qText.includes('caixa') || qText.includes('acompanha') || qText.includes('fonte')) {
        if (details?.attributes?.['Conteúdo da Caixa']) {
          generated += `Na embalagem acompanha: ${details.attributes['Conteúdo da Caixa']}. `;
        } else {
          generated += `O produto vai completo na caixa original lacrada com todos os acessórios originais. `;
        }
      } else if (qText.includes('bateria') || qText.includes('autonomia') || qText.includes('dura')) {
        generated += `A bateria de alta performance dura até 30 horas contínuas de uso com carregamento rápido USB-C. `;
      } else if (qText.includes('pronta') || qText.includes('estoque') || qText.includes('envio') || qText.includes('full')) {
        generated += `Sim, temos estoque à pronta entrega com envio imediato pelo Full do Mercado Livre, o mais rápido do Brasil! `;
      } else {
        generated += `O produto conta com garantia de 12 meses, envio imediato Full e nota fiscal. `;
      }

      if (qText.includes('nota') || qText.includes('fiscal') || qText.includes('nf') || qText.includes('cnpj')) {
        generated += `Emitimos Nota Fiscal integral automaticamente tanto para CPF quanto para CNPJ. `;
      }

      if (details?.warranty) {
        generated += `Acompanha ${details.warranty}. `;
      }

      generated += `Ficamos à total disposição para o que precisar e aguardamos sua compra!`;

      setResponseText(generated);
      setIsGeneratingAi(false);
    }, 600);
  };

  const handleApplyTemplate = (type: 'pronta_entrega' | 'compatibilidade' | 'nota_fiscal' | 'garantia') => {
    let template = '';
    const details = selectedQuestion?.productDetails;

    switch (type) {
      case 'pronta_entrega':
        template = 'Olá! Sim, temos o produto à pronta entrega com envio imediato pelo Centro de Distribuição Full do Mercado Livre. Emitimos Nota Fiscal em todos os pedidos.';
        break;
      case 'compatibilidade':
        template = details?.compatibility
          ? `Olá! O produto é 100% compatível com ${details.compatibility}. Qualquer dúvida adicional estamos à disposição.`
          : 'Olá! Sim, o produto possui compatibilidade universal Plug & Play com os principais dispositivos e sistemas operacionais.';
        break;
      case 'nota_fiscal':
        template = 'Olá! Sim, emitimos Nota Fiscal (NF-e) para 100% das vendas, tanto para pessoa física (CPF) quanto para pessoa jurídica (CNPJ).';
        break;
      case 'garantia':
        template = details?.warranty
          ? `Olá! O produto possui ${details.warranty} oficial com suporte técnico direto e atendimento pós-venda garantido.`
          : 'Olá! Todos os nossos produtos possuem garantia de fábrica de 12 meses contra qualquer defeito.';
        break;
    }

    setResponseText(template);
  };

  const handleCopyAnswer = () => {
    if (!responseText.trim()) return;
    navigator.clipboard.writeText(responseText.trim()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }).catch(() => {});
  };

  const handleMarkAsAnsweredLocally = () => {
    if (!selectedQuestion) return;
    const updated = questionsList.map((q) =>
      q.id === selectedQuestion.id
        ? { ...q, status: 'answered' as const, answerText: responseText || 'Resposta enviada no Mercado Livre', answeredAt: new Date().toISOString() }
        : q
    );
    setQuestionsList(updated);
    setSelectedQuestion((prev) => (prev ? { ...prev, status: 'answered', answerText: responseText || 'Resposta enviada no Mercado Livre', answeredAt: new Date().toISOString() } : null));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">Copilot de Pré-Vendas & Dúvidas ML</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
              Copilot Read-Only (Copiar & Colar)
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            A IA analisa as especificações reais do anúncio e sintetiza a resposta ideal para você copiar e colar no painel do Mercado Livre.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span><strong>100% Seguro:</strong> Sem risco de envios acidentais. Permissão somente-leitura.</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por pergunta, comprador ou produto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 pt-1 border-t border-gray-100 text-xs">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Todas ({questionsList.length})
              </button>
              <button
                onClick={() => setFilter('unanswered')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filter === 'unanswered'
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Urgentes ({questionsList.filter((q) => q.status === 'unanswered').length})
              </button>
              <button
                onClick={() => setFilter('answered')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filter === 'answered'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Respondidas ({questionsList.filter((q) => q.status === 'answered').length})
              </button>
            </div>
          </div>

          {/* Question List Container */}
          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredQuestions.map((q) => {
              const timerInfo = getResponseTimerInfo(q.createdAt);
              const isSelected = selectedQuestion?.id === q.id;

              return (
                <div
                  key={q.id}
                  onClick={() => handleSelectQuestion(q)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 shadow-sm ring-1 ring-blue-500/20'
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center">
                        {q.buyerName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{q.buyerName}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{q.productMlId || 'MLB'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {q.status === 'unanswered' ? (
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${timerInfo.badgeClass}`}>
                          {timerInfo.text}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Respondida
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-800 font-medium line-clamp-2 leading-relaxed mb-2">
                    "{q.questionText}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100">
                    <span className="truncate max-w-[220px] font-medium text-gray-600">
                      {q.productTitle}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 rounded-md font-semibold text-gray-600">
                      {q.category}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Detail & Copilot */}
        <div className="lg:col-span-7">
          {selectedQuestion ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-5">
              {/* Product Header */}
              <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                <img
                  src={selectedQuestion.productImage}
                  alt={selectedQuestion.productTitle}
                  className="w-16 h-16 rounded-xl object-cover border border-gray-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 mb-1">
                    {selectedQuestion.category}
                  </span>
                  <h3 className="text-base font-bold text-gray-900 leading-snug">
                    {selectedQuestion.productTitle}
                  </h3>
                  <p className="text-xs text-blue-600 font-mono mt-0.5">
                    {selectedQuestion.productMlId || 'MLB-1002341'} &middot; Anúncio Ativo
                  </p>
                </div>
              </div>

              {/* Product Specifications Badge Grid */}
              {selectedQuestion.productDetails && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Ficha Técnica & Atributos Analisados pela IA:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-700">
                    <div><strong className="text-slate-500">Marca:</strong> {selectedQuestion.productDetails.brand || 'ApexTech'}</div>
                    <div><strong className="text-slate-500">Garantia:</strong> {selectedQuestion.productDetails.warranty || '12 meses'}</div>
                    <div><strong className="text-slate-500">Tensão:</strong> {selectedQuestion.productDetails.voltage || 'Bivolt'}</div>
                    <div><strong className="text-slate-500">Envio:</strong> Full Pronta Entrega</div>
                    <div><strong className="text-slate-500">Nota Fiscal:</strong> CNPJ & CPF</div>
                    <div><strong className="text-slate-500">Compatibilidade:</strong> {selectedQuestion.productDetails.compatibility || 'Universal'}</div>
                  </div>
                </div>
              )}

              {/* Buyer Question Card */}
              <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-amber-600" />
                    Pergunta do Comprador ({selectedQuestion.buyerName}):
                  </span>
                  <span className="text-amber-700 text-[11px]">{formatDate(selectedQuestion.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-900 font-medium leading-relaxed pl-1">
                  "{selectedQuestion.questionText}"
                </p>
              </div>

              {/* AI Copilot Draft Box */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Copilot de Respostas com IA</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateAiResponse}
                    disabled={isGeneratingAi}
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-xs transition transform active:scale-95 disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                    <span>{isGeneratingAi ? 'Analisando Ficha Técnica...' : 'Gerar Resposta com IA (1-Clique)'}</span>
                  </button>
                </div>

                {/* Templates */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Modelos Rápidos com 1 Toque:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('pronta_entrega')}
                      className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 transition"
                    >
                      <Truck className="w-3 h-3 text-emerald-600" /> Tem pronta entrega?
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('compatibilidade')}
                      className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 transition"
                    >
                      <Zap className="w-3 h-3 text-blue-600" /> Compatibilidade
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('nota_fiscal')}
                      className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 transition"
                    >
                      <FileText className="w-3 h-3 text-purple-600" /> Emissão de NF
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('garantia')}
                      className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-700 transition"
                    >
                      <ShieldCheck className="w-3 h-3 text-amber-600" /> Garantia
                    </button>
                  </div>
                </div>

                {/* Editable Text Area */}
                <div className="relative">
                  <textarea
                    rows={4}
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Sua resposta gerada pela IA aparecerá aqui. Você pode editar livremente antes de copiar..."
                    className="w-full p-3.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-2xs"
                  />
                </div>

                {/* Actions Footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="text-xs text-slate-400">
                    {responseText.length} caracteres
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyAnswer}
                      disabled={!responseText.trim()}
                      className={`inline-flex items-center gap-2 font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition transform active:scale-95 ${
                        copied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Copiado! Cole no Mercado Livre</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar Resposta (1-Clique)</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleMarkAsAnsweredLocally}
                      disabled={!responseText.trim()}
                      className="px-3 py-2.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-semibold transition"
                      title="Marcar como tratada na fila"
                    >
                      Marcar como Respondida
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
              Selecione uma dúvida da lista para gerar e copiar a resposta.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
