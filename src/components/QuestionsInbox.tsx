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
  Building2
} from 'lucide-react';

interface QuestionsInboxProps {
  questions: Question[];
}

export function getResponseTimerInfo(createdAtStr: string) {
  const diffMs = Date.now() - new Date(createdAtStr).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  let timeAgo = '';
  if (diffMins < 1) {
    timeAgo = 'há poucos segundos';
  } else if (diffMins < 60) {
    timeAgo = `há ${diffMins} min${diffMins > 1 ? 's' : ''}`;
  } else if (diffHours < 24) {
    timeAgo = `há ${diffHours}h ${diffMins % 60}m`;
  } else {
    timeAgo = `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
  }

  let urgency: 'fast' | 'warning' | 'critical' = 'fast';
  let reputationText = 'Resposta rápida • Ótimo impacto';

  if (diffMins > 60) {
    urgency = 'critical';
    reputationText = 'Impacto na reputação (Atraso)';
  } else if (diffMins > 15) {
    urgency = 'warning';
    reputationText = 'Atenção ao tempo de resposta';
  }

  return { timeAgo, urgency, reputationText, diffMins };
}

export function generateAiResponse(question: Question): string {
  const text = question.questionText.toLowerCase();
  const details = question.productDetails;
  const buyerFirstName = question.buyerName.split(' ')[0];

  const responseParts: string[] = [`Olá, ${buyerFirstName}! Agradecemos pelo interesse no nosso ${question.productTitle}.`];

  if (text.includes('mac') || text.includes('compatí') || text.includes('funciona em') || text.includes('compativel')) {
    if (details?.compatibility) {
      responseParts.push(`Sim, este modelo é compatível com ${details.compatibility}.`);
    } else {
      responseParts.push(`Sim, o produto possui ampla compatibilidade e funciona perfeitamente!`);
    }
  }

  if (text.includes('cabo') || text.includes('caixa') || text.includes('vem com') || text.includes('embalagem') || text.includes('displayport') || text.includes('hdmi')) {
    if (details?.attributes?.['Conteúdo da Caixa']) {
      responseParts.push(`A embalagem acompanha: ${details.attributes['Conteúdo da Caixa']}.`);
    } else {
      responseParts.push(`O produto acompanha os cabos e acessórios descritos no anúncio.`);
    }
  }

  if (text.includes('bateria') || text.includes('durac') || text.includes('autonomia') || text.includes('anc')) {
    if (details?.attributes?.['Bateria']) {
      responseParts.push(`A bateria de alta capacidade (${details.attributes['Bateria']}) oferece excelente autonomia.`);
    } else {
      responseParts.push(`Oferece excelente autonomia de bateria para uso contínuo.`);
    }
  }

  if (text.includes('pronta entrega') || text.includes('estoque') || text.includes('full') || text.includes('envio')) {
    if (details?.fullShipping) {
      responseParts.push(`Temos pronta entrega com envio super rápido pelo Mercado Livre Full!`);
    } else if (details?.inStock) {
      responseParts.push(`Temos o produto em estoque com pronta entrega.`);
    }
  }

  if (text.includes('nota') || text.includes('nf') || text.includes('cnpj')) {
    if (details?.invoiceProvided) {
      responseParts.push(`Emitimos Nota Fiscal eletrônica (NF-e) para CPF e CNPJ em 100% das vendas.`);
    }
  }

  if (text.includes('garantia') || text.includes('garantía')) {
    if (details?.warranty) {
      responseParts.push(`O produto conta com ${details.warranty}.`);
    }
  }

  if (responseParts.length === 1) {
    if (details?.brand && details?.model) {
      responseParts.push(`Este modelo ${details.brand} ${details.model} é original e de altíssima qualidade.`);
    }
    if (details?.warranty) {
      responseParts.push(`Possui ${details.warranty}.`);
    }
    if (details?.fullShipping) {
      responseParts.push(`Temos pronta entrega com envio imediato via Mercado Livre Full e emissão de Nota Fiscal.`);
    }
  }

  responseParts.push(`Qualquer dúvida estamos à disposição. Aguardamos sua compra!`);
  return responseParts.join(' ');
}

export const QuestionsInbox: React.FC<QuestionsInboxProps> = ({ questions: initialQuestions }) => {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [questionsList, setQuestionsList] = useState<Question[]>(initialQuestions);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  const [filter, setFilter] = useState<'all' | 'unanswered' | 'answered'>('all');
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(initialQuestions[0]?.id || '');
  const [responseText, setResponseText] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  // Extract unique products for "Por Anúncio" filter
  const productOptions = Array.from(
    new Set(questionsList.map((q) => q.productTitle))
  );

  const selectedQuestion = questionsList.find((q) => q.id === selectedQuestionId) || questionsList[0] || null;

  const filteredQuestions = questionsList.filter((q) => {
    const matchesFilter = filter === 'all' || q.status === filter;
    const matchesProduct = selectedProductFilter === 'all' || q.productTitle === selectedProductFilter;
    const matchesSearch =
      q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.productTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.productMlId && q.productMlId.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesProduct && matchesSearch;
  });

  const handleSelectQuestion = (q: Question) => {
    setSelectedQuestionId(q.id);
    setResponseText('');
  };

  const handleGenerateAiResponse = () => {
    if (!selectedQuestion) return;
    setIsGeneratingAi(true);
    setTimeout(() => {
      const generated = generateAiResponse(selectedQuestion);
      setResponseText(generated);
      setIsGeneratingAi(false);
    }, 400);
  };

  const handleApplyTemplate = (templateType: 'pronta_entrega' | 'compatibilidade' | 'nota_fiscal' | 'garantia') => {
    if (!selectedQuestion) return;
    const buyerFirstName = selectedQuestion.buyerName.split(' ')[0];
    const details = selectedQuestion.productDetails;

    let templateContent = '';
    switch (templateType) {
      case 'pronta_entrega':
        templateContent = `Olá, ${buyerFirstName}! Sim, produto em estoque com pronta entrega e envio rápido pelo Mercado Livre Full com Nota Fiscal.`;
        break;
      case 'compatibilidade':
        templateContent = `Olá, ${buyerFirstName}! O produto é compatível com ${details?.compatibility || 'os principais modelos e sistemas do mercado'}.`;
        break;
      case 'nota_fiscal':
        templateContent = `Olá, ${buyerFirstName}! Emitimos Nota Fiscal (NF-e) para CPF e CNPJ em todas as compras com garantia oficial.`;
        break;
      case 'garantia':
        templateContent = `Olá, ${buyerFirstName}! Produto novo, 100% original e com ${details?.warranty || 'garantia de fábrica contra defeitos'}.`;
        break;
    }

    setResponseText(templateContent);
  };

  const handleSubmitAnswer = () => {
    if (!selectedQuestion || !responseText.trim()) return;

    setQuestionsList((prev) =>
      prev.map((q) =>
        q.id === selectedQuestion.id
          ? {
              ...q,
              status: 'answered',
              answerText: responseText.trim(),
              answeredAt: new Date().toISOString(),
            }
          : q
      )
    );
    setResponseText('');
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Banner / Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">Pre-Sales Buyer Questions Inbox</h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> AI Copilot Active
            </span>
            <ReadOnlyBadge size="sm" label="Interactive Demo" />
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Responda dúvidas de pré-venda com 1 clique usando IA generativa com base nos atributos do anúncio.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-2 rounded-xl">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Perguntas sem resposta afetam a reputação e a taxa de conversão do Mercado Livre.</span>
        </div>
      </div>

      {/* Main Grid: Question List & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Filters and Question List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar pergunta, produto, comprador..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100 text-xs">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Todas ({questionsList.length})
              </button>
              <button
                onClick={() => setFilter('unanswered')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filter === 'unanswered'
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Não Respondidas (Urgentes) ({questionsList.filter((q) => q.status === 'unanswered').length})
              </button>
              <button
                onClick={() => setFilter('answered')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filter === 'answered'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Respondidas ({questionsList.filter((q) => q.status === 'answered').length})
              </button>
            </div>

            {/* Filter por Anúncio */}
            <div className="pt-2 border-t border-gray-100 flex items-center gap-2 text-xs">
              <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="font-medium text-gray-600 shrink-0">Por Anúncio:</span>
              <select
                value={selectedProductFilter}
                onChange={(e) => setSelectedProductFilter(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 truncate"
              >
                <option value="all">Todos os Anúncios ({productOptions.length})</option>
                {productOptions.map((prod) => (
                  <option key={prod} value={prod}>
                    {prod}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* List of Questions */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs divide-y divide-gray-100 overflow-hidden max-h-[600px] overflow-y-auto">
            {filteredQuestions.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                Nenhuma pergunta encontrada com os filtros selecionados.
              </div>
            ) : (
              filteredQuestions.map((q) => {
                const isSelected = selectedQuestion?.id === q.id;
                const timerInfo = getResponseTimerInfo(q.createdAt);
                return (
                  <div
                    key={q.id}
                    onClick={() => handleSelectQuestion(q)}
                    className={`p-4 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/70 border-l-4 border-blue-600' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-gray-600 truncate">{q.buyerName}</span>
                      {q.status === 'unanswered' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full shrink-0">
                          <AlertCircle className="w-3 h-3 text-amber-600" /> Pendente
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Respondida
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">{q.productTitle}</h4>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">"{q.questionText}"</p>

                    {/* Response Timer indicator */}
                    {q.status === 'unanswered' && isMounted && (
                      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${
                            timerInfo.urgency === 'critical'
                              ? 'bg-red-100 text-red-700 font-semibold'
                              : timerInfo.urgency === 'warning'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          Perguntado {timerInfo.timeAgo} - {timerInfo.reputationText}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-gray-400 mt-3 pt-2 border-t border-gray-100">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatDate(q.createdAt)}
                      </span>
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-medium">
                        {q.category}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Question & Copilot View */}
        <div className="lg:col-span-7">
          {selectedQuestion ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-6 space-y-6">
              {/* Product Header */}
              <div className="flex items-start gap-4 pb-5 border-b border-gray-100">
                <img
                  src={selectedQuestion.productImage}
                  alt={selectedQuestion.productTitle}
                  className="w-16 h-16 object-cover rounded-xl border border-gray-200 shrink-0"
                />
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      {selectedQuestion.category}
                    </span>
                    {selectedQuestion.productMlId && (
                      <span className="text-xs text-gray-400 font-mono">• {selectedQuestion.productMlId}</span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 leading-snug">{selectedQuestion.productTitle}</h3>
                </div>
              </div>

              {/* Product Specs / Metadata Card */}
              {selectedQuestion.productDetails && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-slate-700 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-blue-600" /> Atributos e Ficha Técnica do Anúncio
                    </span>
                    <span className="text-[11px] font-normal text-slate-500">
                      Usados pelo Copilot IA
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-600">
                    {selectedQuestion.productDetails.brand && (
                      <div>
                        <span className="text-slate-400 block font-medium">Marca:</span>
                        <span className="font-semibold text-slate-800">{selectedQuestion.productDetails.brand}</span>
                      </div>
                    )}
                    {selectedQuestion.productDetails.voltage && (
                      <div>
                        <span className="text-slate-400 block font-medium">Voltagem:</span>
                        <span className="font-semibold text-slate-800">{selectedQuestion.productDetails.voltage}</span>
                      </div>
                    )}
                    {selectedQuestion.productDetails.warranty && (
                      <div>
                        <span className="text-slate-400 block font-medium">Garantia:</span>
                        <span className="font-semibold text-slate-800">{selectedQuestion.productDetails.warranty}</span>
                      </div>
                    )}
                    {selectedQuestion.productDetails.fullShipping && (
                      <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                        <Truck className="w-3.5 h-3.5 text-emerald-600" /> Mercado Livre Full
                      </div>
                    )}
                    {selectedQuestion.productDetails.invoiceProvided && (
                      <div className="flex items-center gap-1 text-blue-700 font-semibold">
                        <FileText className="w-3.5 h-3.5 text-blue-600" /> Emitimos Nota Fiscal
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Buyer Question Card */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                      {selectedQuestion.buyerName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{selectedQuestion.buyerName}</p>
                      <p className="text-[10px] text-gray-400">Comprador no Mercado Livre</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(selectedQuestion.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed pl-1 font-medium">
                  "{selectedQuestion.questionText}"
                </p>
              </div>

              {/* Seller Answer Section or Copilot Form */}
              {selectedQuestion.status === 'answered' ? (
                <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                        S
                      </div>
                      <div>
                        <p className="text-xs font-bold text-emerald-950">Apex Tech Direct (Resposta Enviada)</p>
                        <p className="text-[10px] text-emerald-700">Vendedor Oficial</p>
                      </div>
                    </div>
                    {selectedQuestion.answeredAt && (
                      <span className="text-xs text-emerald-600">{formatDate(selectedQuestion.answeredAt)}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed pl-1 bg-white/70 p-3 rounded-xl border border-emerald-100">
                    {selectedQuestion.answerText}
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>Copilot de Respostas com IA</span>
                    </div>

                    {/* AI Generation Trigger Button */}
                    <button
                      type="button"
                      onClick={handleGenerateAiResponse}
                      disabled={isGeneratingAi}
                      className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-sm transition transform active:scale-95 disabled:opacity-50"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                      <span>{isGeneratingAi ? 'Analisando Atributos...' : 'Gerar Resposta com IA (1-Clique)'}</span>
                    </button>
                  </div>

                  {/* Template Chips */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Modelos Rápidos de Resposta:
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
                      placeholder="Sua resposta editável aparecerá aqui. Você também pode digitar livremente..."
                      className="w-full p-3.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-2xs"
                    />
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-400">
                      {responseText.length} caracteres
                    </span>
                    <button
                      type="button"
                      onClick={handleSubmitAnswer}
                      disabled={!responseText.trim()}
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar Resposta ao Comprador</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
              Selecione uma pergunta da lista para visualizar os detalhes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
