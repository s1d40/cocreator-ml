'use client';

import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Package,
  TrendingUp,
  Activity,
  Zap,
  HelpCircle,
  Star,
  Award,
  Layers,
  Search,
  CheckCircle2,
  Info,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import {
  calculateEstimatedSales,
  ItemData,
  StockSnapshot,
  SalesEstimate,
} from '../lib/sales-inference';

export interface SampleCompetitorItem {
  itemData: ItemData;
  snapshots: StockSnapshot[];
}

export const SAMPLE_COMPETITOR_ITEMS: SampleCompetitorItem[] = [
  {
    itemData: {
      mlbId: 'MLB-2049182',
      title: 'Smartwatch Sport GPS Premium OLED Display 44mm',
      price: 499.90,
      category_id: 'MLB3520',
      categoryRanking: 2,
      totalCategoryItems: 120,
      availableQuantity: 18,
      stockRange: 'RANGO_6_25',
      questionsCount: 42,
      reviewsCount: 128,
      soldQuantity: 840,
    },
    snapshots: [
      {
        timestamp: '2026-08-01T00:00:00Z',
        stockRange: 'RANGO_26_50',
        availableQuantity: 48,
        price: 499.90,
        questionsCount: 20,
        reviewsCount: 110,
      },
      {
        timestamp: '2026-08-07T00:00:00Z',
        stockRange: 'RANGO_26_50',
        availableQuantity: 32,
        price: 499.90,
        questionsCount: 28,
        reviewsCount: 116,
      },
      {
        timestamp: '2026-08-14T00:00:00Z',
        stockRange: 'RANGO_6_25',
        availableQuantity: 18,
        price: 499.90,
        questionsCount: 42,
        reviewsCount: 128,
      },
    ],
  },
  {
    itemData: {
      mlbId: 'MLB-3910482',
      title: 'Fone de Ouvido Bluetooth Noise Cancelling Over-Ear',
      price: 289.00,
      category_id: 'MLB3520',
      categoryRanking: 5,
      totalCategoryItems: 120,
      availableQuantity: 42,
      stockRange: 'RANGO_26_50',
      questionsCount: 15,
      reviewsCount: 64,
      soldQuantity: 310,
    },
    snapshots: [
      {
        timestamp: '2026-08-01T00:00:00Z',
        stockRange: 'RANGO_50_PLUS',
        availableQuantity: 80,
        price: 289.00,
        questionsCount: 5,
        reviewsCount: 55,
      },
      {
        timestamp: '2026-08-14T00:00:00Z',
        stockRange: 'RANGO_26_50',
        availableQuantity: 42,
        price: 289.00,
        questionsCount: 15,
        reviewsCount: 64,
      },
    ],
  },
  {
    itemData: {
      mlbId: 'MLB-1092481',
      title: 'Teclado Mecânico RGB Hot-Swappable Switch Blue',
      price: 350.00,
      category_id: 'MLB1648',
      categoryRanking: 1,
      totalCategoryItems: 85,
      availableQuantity: 5,
      stockRange: 'RANGO_1_5',
      questionsCount: 88,
      reviewsCount: 240,
      soldQuantity: 1450,
    },
    snapshots: [
      {
        timestamp: '2026-08-01T00:00:00Z',
        stockRange: 'RANGO_26_50',
        availableQuantity: 45,
        price: 350.00,
        questionsCount: 60,
        reviewsCount: 210,
      },
      {
        timestamp: '2026-08-14T00:00:00Z',
        stockRange: 'RANGO_1_5',
        availableQuantity: 5,
        price: 350.00,
        questionsCount: 88,
        reviewsCount: 240,
      },
    ],
  },
];

export function SalesEstimator() {
  const [selectedMlbId, setSelectedMlbId] = useState<string>(SAMPLE_COMPETITOR_ITEMS[0].itemData.mlbId);
  const [customPrice, setCustomPrice] = useState<number | null>(null);
  const [projectionHorizon, setProjectionHorizon] = useState<'30' | '60' | '90'>('90');

  const currentSample = useMemo(() => {
    return (
      SAMPLE_COMPETITOR_ITEMS.find((item) => item.itemData.mlbId === selectedMlbId) ||
      SAMPLE_COMPETITOR_ITEMS[0]
    );
  }, [selectedMlbId]);

  const activeItemData = useMemo(() => {
    if (customPrice !== null) {
      return { ...currentSample.itemData, price: customPrice };
    }
    return currentSample.itemData;
  }, [currentSample, customPrice]);

  const estimate: SalesEstimate = useMemo(() => {
    return calculateEstimatedSales(activeItemData, currentSample.snapshots);
  }, [activeItemData, currentSample]);

  // Ticket Médio
  const ticketMedio = activeItemData.price;

  // Chart Data: Projections over 30/60/90 days
  const projectionChartData = useMemo(() => {
    const days = parseInt(projectionHorizon, 10);
    const data = [];
    const dailyUnits = estimate.estimatedDailyUnits;
    const price = activeItemData.price;

    for (let day = 1; day <= days; day += Math.ceil(days / 15)) {
      const cumulativeUnits = Math.round(dailyUnits * day);
      const cumulativeRevenue = Number((cumulativeUnits * price).toFixed(2));
      data.push({
        day: `Dia ${day}`,
        unidades: cumulativeUnits,
        faturamento: cumulativeRevenue,
      });
    }

    return data;
  }, [projectionHorizon, estimate, activeItemData]);

  return (
    <div className="space-y-6">
      {/* Competitor Listing Selector & Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Stochastic Estimator Engine
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Zipf Law &amp; Stock Range Deltas
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Estimador de Volume de Vendas &amp; Receita de Concorrentes
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Estimativas probabilísticas baseadas em transições de estoque (ex: RANGO_6_25), velocidade de perguntas e reviews.
          </p>
        </div>

        {/* Selector */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <select
              value={selectedMlbId}
              onChange={(e) => {
                setSelectedMlbId(e.target.value);
                setCustomPrice(null);
              }}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {SAMPLE_COMPETITOR_ITEMS.map((item) => (
                <option key={item.itemData.mlbId} value={item.itemData.mlbId}>
                  {item.itemData.mlbId} - {item.itemData.title?.substring(0, 30)}...
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Item Info Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
            Item Analisado
          </span>
          <h3 className="text-lg font-bold mt-1 text-slate-100">{activeItemData.title}</h3>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2">
            <span>
              MLB ID: <strong className="text-white">{activeItemData.mlbId}</strong>
            </span>
            <span>
              Ranking Categoria: <strong className="text-amber-400">#{activeItemData.categoryRanking || 'N/A'}</strong>
            </span>
            <span>
              Faixa de Estoque Atual: <strong className="text-white">{activeItemData.stockRange || 'N/A'}</strong>
            </span>
            <span>
              Histórico de Vendas Registradas: <strong className="text-white">{activeItemData.soldQuantity || 'N/A'} un</strong>
            </span>
          </div>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-lg flex items-center gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
              Preço Unitário (R$)
            </label>
            <input
              type="number"
              value={customPrice !== null ? customPrice : activeItemData.price}
              onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
              className="w-24 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-amber-400 font-bold focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>
          <div className="text-right border-l border-slate-700 pl-3">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">
              Confiança
            </span>
            <span className="text-base font-bold text-emerald-400">
              {estimate.confidenceScore}%
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Faturamento Mensal Estimado */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Faturamento Mensal Estimado
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              R${' '}
              {estimate.estimatedMonthlyRevenue.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Base de 30 dias projetados
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Unidades Vendidas / Mês */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Unidades Vendidas / Mês
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {estimate.estimatedMonthlyUnits}{' '}
              <span className="text-xs font-normal text-slate-500">unidades</span>
            </p>
            <p className="text-[11px] text-blue-600 font-medium mt-1">
              ~{estimate.estimatedDailyUnits} un / dia
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Ticket Médio */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Ticket Médio
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              R${' '}
              {ticketMedio.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Preço unitário praticado</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Velocidade de Conversão Diária */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Velocidade de Conversão Diária
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {estimate.indicators.stockTransitionDelta}{' '}
              <span className="text-xs font-normal text-slate-500">un/dia</span>
            </p>
            <p className="text-[11px] text-purple-600 font-medium mt-1 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Transição de Faixa de Estoque
            </p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Zap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Model Indicators & Weights Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
            <Layers className="w-4 h-4 text-blue-500" /> Delta Transição Estoque
          </div>
          <p className="text-xl font-bold text-slate-900 mt-2">
            {estimate.indicators.stockTransitionDelta} <span className="text-xs text-slate-500 font-normal">un/dia</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Calculado via faixas referenciais (ex: RANGO_6_25 para RANGO_1_5).
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-amber-500" /> Velocidade de Perguntas
          </div>
          <p className="text-xl font-bold text-slate-900 mt-2">
            {estimate.indicators.questionVelocityScore} <span className="text-xs text-slate-500 font-normal">perguntas/dia</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Taxa estimada de conversão de dúvidas de compradores.
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
            <Star className="w-4 h-4 text-yellow-500" /> Velocidade de Avaliações
          </div>
          <p className="text-xl font-bold text-slate-900 mt-2">
            {estimate.indicators.reviewVelocityScore} <span className="text-xs text-slate-500 font-normal">reviews/dia</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Frequência de novos comentários de compradores.
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
            <Award className="w-4 h-4 text-purple-500" /> Peso Ranking Zipf
          </div>
          <p className="text-xl font-bold text-slate-900 mt-2">
            {(estimate.indicators.rankingWeight * 100).toFixed(0)}% <span className="text-xs text-slate-500 font-normal">relativo</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Fator de distribuição de Lei de Zipf para ranking da categoria.
          </p>
        </div>
      </div>

      {/* Revenue Projections Chart over 30/60/90 days */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Projeção de Faturamento Acumulado ({projectionHorizon} Dias)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Estimativa de receita contínua com base no ritmo diário atual de vendas.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
            <button
              onClick={() => setProjectionHorizon('30')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                projectionHorizon === '30'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 Dias
            </button>
            <button
              onClick={() => setProjectionHorizon('60')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                projectionHorizon === '60'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              60 Dias
            </button>
            <button
              onClick={() => setProjectionHorizon('90')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                projectionHorizon === '90'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              90 Dias
            </button>
          </div>
        </div>

        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionChartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorFaturamento" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="day" stroke="#64748B" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#FFF' }}
                formatter={(val: any, name: string) => [
                  name === 'faturamento'
                    ? `R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    : `${val} un`,
                  name === 'faturamento' ? 'Faturamento Acumulado' : 'Unidades Acumuladas',
                ]}
              />
              <Area
                type="monotone"
                dataKey="faturamento"
                stroke="#10B981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorFaturamento)"
                name="faturamento"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
