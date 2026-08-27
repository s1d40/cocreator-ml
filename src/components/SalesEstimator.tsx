'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  AlertTriangle,
  Clock,
  ShieldAlert,
  Sliders,
  RefreshCw,
  ExternalLink,
  Tag,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
} from 'recharts';
import {
  calculateEstimatedSales,
  runMonteCarloSimulation,
  parseStockRangeValue,
  quantityToStockRange,
  ItemData,
  StockSnapshot,
  SalesEstimate,
  SimulationHorizon,
  ConfidenceIntervalLevel,
  MonteCarloResult,
} from '../lib/sales-inference';
import { useSettings } from '../context/SettingsContext';

export interface SampleCompetitorItem {
  itemData: ItemData;
  snapshots: StockSnapshot[];
  categoryName?: string;
}

export const SAMPLE_COMPETITOR_ITEMS: SampleCompetitorItem[] = [
  {
    categoryName: 'Smartwatches e Acessórios',
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
      dateCreated: '2026-01-15T00:00:00Z',
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
    categoryName: 'Áudio e Fones de Ouvido',
    itemData: {
      mlbId: 'MLB-3910482',
      title: 'Fone de Ouvido Bluetooth Noise Cancelling Over-Ear High Fidelity',
      price: 289.00,
      category_id: 'MLB3520',
      categoryRanking: 5,
      totalCategoryItems: 120,
      availableQuantity: 42,
      stockRange: 'RANGO_26_50',
      questionsCount: 15,
      reviewsCount: 64,
      soldQuantity: 310,
      dateCreated: '2026-03-10T00:00:00Z',
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
    categoryName: 'Periféricos para PC',
    itemData: {
      mlbId: 'MLB-1092481',
      title: 'Teclado Mecânico RGB Hot-Swappable Switch Blue ABNT2',
      price: 350.00,
      category_id: 'MLB1648',
      categoryRanking: 1,
      totalCategoryItems: 85,
      availableQuantity: 5,
      stockRange: 'RANGO_1_5',
      questionsCount: 88,
      reviewsCount: 240,
      soldQuantity: 1450,
      dateCreated: '2025-11-20T00:00:00Z',
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
  const settingsContext = useSettings();
  const token = settingsContext?.settings?.api?.accessToken;

  // Selected Item State
  const [selectedMlbId, setSelectedMlbId] = useState<string>(SAMPLE_COMPETITOR_ITEMS[0].itemData.mlbId);
  const [customItems, setCustomItems] = useState<SampleCompetitorItem[]>([]);

  // Search Bar State
  const [searchInput, setSearchInput] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Interactive Parameter Controls State
  const [projectionHorizon, setProjectionHorizon] = useState<SimulationHorizon>(90);
  const [confidenceInterval, setConfidenceInterval] = useState<ConfidenceIntervalLevel>(90);
  const [selectedStockRange, setSelectedStockRange] = useState<string>('RANGO_6_25');
  const [overrideStockQty, setOverrideStockQty] = useState<number | null>(null);
  const [priceElasticity, setPriceElasticity] = useState<number>(1.2);
  const [customPrice, setCustomPrice] = useState<number | null>(null);

  // Combine Sample Items with Custom / Searched Items
  const allListings = useMemo(() => {
    return [...SAMPLE_COMPETITOR_ITEMS, ...customItems];
  }, [customItems]);

  // Current active sample item
  const currentSample = useMemo(() => {
    return (
      allListings.find((item) => item.itemData.mlbId === selectedMlbId) ||
      allListings[0]
    );
  }, [allListings, selectedMlbId]);

  // Update controls when selected item changes
  useEffect(() => {
    const range = currentSample.itemData.stockRange || quantityToStockRange(currentSample.itemData.availableQuantity || 10);
    setSelectedStockRange(range);
    const qty = currentSample.itemData.availableQuantity !== undefined
      ? currentSample.itemData.availableQuantity
      : parseStockRangeValue(range);
    setOverrideStockQty(qty);
    setCustomPrice(null);
  }, [currentSample]);

  // Active item data reflecting price and stock range overrides
  const activeItemData = useMemo(() => {
    const effectiveStockQty = overrideStockQty !== null ? overrideStockQty : parseStockRangeValue(selectedStockRange);
    return {
      ...currentSample.itemData,
      price: customPrice !== null ? customPrice : currentSample.itemData.price,
      stockRange: selectedStockRange,
      availableQuantity: effectiveStockQty,
    };
  }, [currentSample, customPrice, selectedStockRange, overrideStockQty]);

  // Base Sales Estimate
  const estimate: SalesEstimate = useMemo(() => {
    return calculateEstimatedSales(activeItemData, currentSample.snapshots);
  }, [activeItemData, currentSample]);

  // Monte Carlo Simulation Engine
  const monteCarloResult: MonteCarloResult = useMemo(() => {
    const currentStock = overrideStockQty !== null ? overrideStockQty : parseStockRangeValue(selectedStockRange);
    return runMonteCarloSimulation({
      baseDailyUnits: estimate.estimatedDailyUnits,
      unitPrice: activeItemData.price,
      basePrice: currentSample.itemData.price,
      horizonDays: projectionHorizon,
      confidenceInterval,
      currentStock,
      elasticity: priceElasticity,
      simulationsCount: 1000,
    });
  }, [
    estimate,
    activeItemData,
    currentSample,
    projectionHorizon,
    confidenceInterval,
    selectedStockRange,
    overrideStockQty,
    priceElasticity,
  ]);

  // Handler to search live MLB ID or query via API
  const handleLiveMlbSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const rawQuery = searchInput.trim();
    if (!rawQuery) return;

    setIsSearching(true);
    setSearchError(null);

    // Clean MLB ID format if typed
    const cleanIdMatch = rawQuery.match(/MLB-?\d+/i);
    const searchMlbId = cleanIdMatch ? cleanIdMatch[0].toUpperCase().replace('-', '') : null;

    try {
      if (searchMlbId) {
        // Fetch specific MLB item
        const res = await fetch('/api/ml-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: `/items/${searchMlbId}`,
            token: token || undefined,
          }),
        });

        const data = await res.json();

        if (res.ok && data.id) {
          let categoryName = 'Categoria Mercado Livre';
          if (data.category_id) {
            try {
              const catRes = await fetch('/api/ml-proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ endpoint: `/categories/${data.category_id}` }),
              });
              const catData = await catRes.json();
              if (catData.name) categoryName = catData.name;
            } catch {
              // ignore category name fetch error
            }
          }

          const availableQty = data.available_quantity ?? 12;
          const rangeCode = quantityToStockRange(availableQty);

          const fetchedItem: SampleCompetitorItem = {
            categoryName,
            itemData: {
              mlbId: data.id,
              title: data.title || `Anúncio ${data.id}`,
              price: data.price || 199.9,
              category_id: data.category_id,
              categoryRanking: 3,
              totalCategoryItems: 100,
              availableQuantity: availableQty,
              stockRange: rangeCode,
              soldQuantity: data.sold_quantity || 150,
              questionsCount: 25,
              reviewsCount: 14,
              dateCreated: data.date_created || new Date().toISOString(),
            },
            snapshots: [
              {
                timestamp: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
                stockRange: quantityToStockRange(availableQty + 20),
                availableQuantity: availableQty + 20,
                price: data.price || 199.9,
                questionsCount: 10,
                reviewsCount: 8,
              },
              {
                timestamp: new Date().toISOString(),
                stockRange: rangeCode,
                availableQuantity: availableQty,
                price: data.price || 199.9,
                questionsCount: 25,
                reviewsCount: 14,
              },
            ],
          };

          setCustomItems((prev) => [fetchedItem, ...prev.filter((i) => i.itemData.mlbId !== data.id)]);
          setSelectedMlbId(data.id);
          setSearchInput('');
        } else {
          // If not found or API error, create simulated item for searched ID so user can still analyze
          const simulatedItem: SampleCompetitorItem = {
            categoryName: 'Item Pesquisado (Simulado)',
            itemData: {
              mlbId: searchMlbId,
              title: `Produto MLB ID ${searchMlbId} - Simulação em Tempo Real`,
              price: 249.90,
              categoryRanking: 4,
              totalCategoryItems: 100,
              availableQuantity: 20,
              stockRange: 'RANGO_6_25',
              soldQuantity: 320,
              questionsCount: 18,
              reviewsCount: 12,
              dateCreated: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
            },
            snapshots: [
              {
                timestamp: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
                stockRange: 'RANGO_26_50',
                availableQuantity: 40,
                price: 249.90,
                questionsCount: 10,
                reviewsCount: 8,
              },
              {
                timestamp: new Date().toISOString(),
                stockRange: 'RANGO_6_25',
                availableQuantity: 20,
                price: 249.90,
                questionsCount: 18,
                reviewsCount: 12,
              },
            ],
          };

          setCustomItems((prev) => [simulatedItem, ...prev.filter((i) => i.itemData.mlbId !== searchMlbId)]);
          setSelectedMlbId(searchMlbId);
          setSearchError(`API Mercado Livre: MLB ID não retornado na API pública. Carregado modo de simulação probabilística para ${searchMlbId}.`);
          setSearchInput('');
        }
      } else {
        // Free text search query on ML API
        const searchRes = await fetch('/api/ml-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: `/sites/MLB/search?q=${encodeURIComponent(rawQuery)}&limit=1`,
            token: token || undefined,
          }),
        });

        const searchData = await searchRes.json();
        const firstResult = searchData.results?.[0];

        if (firstResult && firstResult.id) {
          const availableQty = firstResult.available_quantity ?? 15;
          const rangeCode = quantityToStockRange(availableQty);

          const searchedItem: SampleCompetitorItem = {
            categoryName: firstResult.category_id || 'Busca ao Vivo',
            itemData: {
              mlbId: firstResult.id,
              title: firstResult.title,
              price: firstResult.price,
              category_id: firstResult.category_id,
              categoryRanking: 3,
              availableQuantity: availableQty,
              stockRange: rangeCode,
              soldQuantity: firstResult.sold_quantity || 120,
              questionsCount: 20,
              reviewsCount: 10,
              dateCreated: new Date().toISOString(),
            },
            snapshots: [
              {
                timestamp: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
                stockRange: quantityToStockRange(availableQty + 15),
                availableQuantity: availableQty + 15,
                price: firstResult.price,
                questionsCount: 10,
                reviewsCount: 5,
              },
              {
                timestamp: new Date().toISOString(),
                stockRange: rangeCode,
                availableQuantity: availableQty,
                price: firstResult.price,
                questionsCount: 20,
                reviewsCount: 10,
              },
            ],
          };

          setCustomItems((prev) => [searchedItem, ...prev.filter((i) => i.itemData.mlbId !== firstResult.id)]);
          setSelectedMlbId(firstResult.id);
          setSearchInput('');
        } else {
          setSearchError(`Nenhum anúncio encontrado para a busca "${rawQuery}". Verifique a digitação ou insira um ID formato MLB12345678.`);
        }
      }
    } catch (err: any) {
      console.error('Error fetching live MLB item:', err);
      setSearchError('Falha de conexão com proxy da API Mercado Livre. Tente novamente em instantes.');
    } finally {
      setIsSearching(false);
    }
  };

  // Stock Range Selector change handler
  const handleStockRangeChange = (newRange: string) => {
    setSelectedStockRange(newRange);
    const defaultQty = parseStockRangeValue(newRange);
    setOverrideStockQty(defaultQty);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Search Bar & Header Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-600" /> Stochastic Estimator Engine v2.0
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Monte Carlo &amp; Price Elasticity
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Estimador de Volume de Vendas &amp; Risco de Ruptura
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pesquise qualquer produto Mercado Livre por ID (MLB) ou selecione anúncio para simulações estocásticas Monte Carlo.
          </p>
        </div>

        {/* Live Search & Dropdown Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Search Input */}
          <form onSubmit={handleLiveMlbSearch} className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Ex: MLB2049182 ou Smartwatch"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchInput.trim()}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-bold text-xs rounded-lg transition flex items-center gap-1.5 shadow-xs whitespace-nowrap"
            >
              {isSearching ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Buscando...
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" /> Buscar MLB
                </>
              )}
            </button>
          </form>

          {/* Seller / Sample Listings Dropdown */}
          <div className="relative">
            <select
              value={selectedMlbId}
              onChange={(e) => {
                setSelectedMlbId(e.target.value);
                setSearchError(null);
              }}
              className="w-full sm:w-64 pl-3 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 truncate"
            >
              <optgroup label="Anúncios Exemplo &amp; Pesquisados">
                {allListings.map((item) => (
                  <option key={item.itemData.mlbId} value={item.itemData.mlbId}>
                    {item.itemData.mlbId} - {item.itemData.title?.substring(0, 28)}...
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>
      </div>

      {/* Search Warning / Error Toast if any */}
      {searchError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-3.5 rounded-xl flex items-start gap-2 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{searchError}</p>
          </div>
        </div>
      )}

      {/* Item Info Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3 h-3" /> {currentSample.categoryName || 'Item Selecionado'}
            </span>
            {activeItemData.mlbId && (
              <a
                href={`https://produto.mercadolivre.com.br/${activeItemData.mlbId}`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-300 hover:text-blue-200 flex items-center gap-1 underline"
              >
                Ver no Mercado Livre <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-100">{activeItemData.title}</h3>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
            <span>
              MLB ID: <strong className="text-white font-mono">{activeItemData.mlbId}</strong>
            </span>
            <span>
              Ranking Categoria: <strong className="text-amber-400">#{activeItemData.categoryRanking || 'N/A'}</strong>
            </span>
            <span>
              Faixa de Estoque: <strong className="text-white font-semibold">{activeItemData.stockRange || 'N/A'}</strong>
            </span>
            <span>
              Vendas Registradas: <strong className="text-white">{activeItemData.soldQuantity || 'N/A'} un</strong>
            </span>
          </div>
        </div>

        {/* Confidence & Unit Price Display */}
        <div className="bg-slate-800/90 border border-slate-700/80 p-3.5 rounded-xl flex items-center gap-4 shrink-0">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">
              Preço Base Item (R$)
            </label>
            <span className="text-lg font-extrabold text-amber-400">
              R$ {currentSample.itemData.price.toFixed(2)}
            </span>
          </div>

          <div className="text-right border-l border-slate-700 pl-4">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">
              Confiança Modelo
            </span>
            <span className="text-lg font-extrabold text-emerald-400">
              {estimate.confidenceScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Controls Bar: Simulation Horizon, Confidence Interval, Stock Range, Elasticity */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sliders className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Controles Interativos de Simulação Estocástica
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
          {/* Horizon Selector */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-500" /> Horizonte de Simulação
            </label>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {[15, 30, 60, 90, 180].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setProjectionHorizon(h as SimulationHorizon)}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-md transition ${
                    projectionHorizon === h
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {h}d
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Período de dias para projeção.</p>
          </div>

          {/* Confidence Interval Selector */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-500" /> Intervalo de Confiança
            </label>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {[80, 90, 95].map((ci) => (
                <button
                  key={ci}
                  type="button"
                  onClick={() => setConfidenceInterval(ci as ConfidenceIntervalLevel)}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-md transition ${
                    confidenceInterval === ci
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {ci}%
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Nível de certeza probabilística.</p>
          </div>

          {/* Stock Range Selector & Manual Stock Qty */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-amber-500" /> Faixa &amp; Estoque Atual
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selectedStockRange}
                onChange={(e) => handleStockRangeChange(e.target.value)}
                className="flex-1 py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-400 text-[11px]"
              >
                <option value="RANGO_1_5">RANGO_1_5 (1-5 un)</option>
                <option value="RANGO_6_25">RANGO_6_25 (6-25 un)</option>
                <option value="RANGO_26_50">RANGO_26_50 (26-50 un)</option>
                <option value="RANGO_51_100">RANGO_51_100 (51-100 un)</option>
                <option value="RANGO_100_PLUS">RANGO_100_PLUS (100+ un)</option>
              </select>

              <input
                type="number"
                min="0"
                value={overrideStockQty !== null ? overrideStockQty : ''}
                onChange={(e) => setOverrideStockQty(parseInt(e.target.value, 10) || 0)}
                placeholder="Qtde"
                className="w-16 py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-400 text-[11px]"
                title="Quantidade exata de estoque para cálculo de ruptura"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Estoque para cálculo de ruptura.</p>
          </div>

          {/* Price Elasticity Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-slate-700 font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-purple-500" /> Elasticidade-Preço
              </label>
              <span className="font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                E = {priceElasticity.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={priceElasticity}
              onChange={(e) => setPriceElasticity(parseFloat(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />

            <div className="flex items-center justify-between mt-1 text-[10px]">
              <span className="text-slate-400">Preço Simulado (R$):</span>
              <input
                type="number"
                step="0.1"
                value={customPrice !== null ? customPrice : activeItemData.price}
                onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
                className="w-20 bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 font-bold text-right text-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Monte Carlo Projected Revenue */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Faturamento Estocástico ({projectionHorizon}d)
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              R${' '}
              {monteCarloResult.totalExpectedRevenue.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              Faixa ({confidenceInterval}% CI): R$ {(monteCarloResult.lowerBoundRevenue / 1000).toFixed(1)}k - {(monteCarloResult.upperBoundRevenue / 1000).toFixed(1)}k
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Projected Units Sold */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Unidades Projetadas ({projectionHorizon}d)
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {monteCarloResult.totalExpectedUnits}{' '}
              <span className="text-xs font-normal text-slate-500">unidades</span>
            </p>
            <p className="text-[11px] text-blue-600 font-medium mt-1">
              ~{estimate.estimatedDailyUnits} un / dia base
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Price & Ticket */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Preço Praticado / Ticket
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              R${' '}
              {activeItemData.price.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className="text-[11px] text-purple-600 font-medium mt-1">
              Elasticidade E = {priceElasticity.toFixed(1)}
            </p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Stockout Risk % */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Risco de Ruptura ({projectionHorizon}d)
            </p>
            <p
              className={`text-2xl font-bold mt-1 ${
                monteCarloResult.outOfStockRisk.stockoutProbability > 40
                  ? 'text-red-600'
                  : monteCarloResult.outOfStockRisk.stockoutProbability > 15
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}
            >
              {monteCarloResult.outOfStockRisk.stockoutProbability}%
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Esgotamento em ~{monteCarloResult.outOfStockRisk.estimatedDaysToStockout ?? 'N/A'} dias
            </p>
          </div>
          <div
            className={`p-3 rounded-xl ${
              monteCarloResult.outOfStockRisk.stockoutProbability > 40
                ? 'bg-red-50 text-red-600'
                : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Out-of-Stock Risk Estimation Banner Card */}
      <div
        className={`rounded-xl p-5 border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          monteCarloResult.outOfStockRisk.riskLevel === 'CRITICAL'
            ? 'bg-red-50 border-red-200 text-red-950'
            : monteCarloResult.outOfStockRisk.riskLevel === 'HIGH'
            ? 'bg-amber-50 border-amber-200 text-amber-950'
            : monteCarloResult.outOfStockRisk.riskLevel === 'MEDIUM'
            ? 'bg-yellow-50 border-yellow-200 text-yellow-950'
            : 'bg-emerald-50 border-emerald-200 text-emerald-950'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-lg shrink-0 ${
              monteCarloResult.outOfStockRisk.riskLevel === 'CRITICAL'
                ? 'bg-red-200/80 text-red-700'
                : monteCarloResult.outOfStockRisk.riskLevel === 'HIGH'
                ? 'bg-amber-200/80 text-amber-700'
                : 'bg-emerald-200/80 text-emerald-700'
            }`}
          >
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider ${
                  monteCarloResult.outOfStockRisk.riskLevel === 'CRITICAL'
                    ? 'bg-red-600 text-white'
                    : monteCarloResult.outOfStockRisk.riskLevel === 'HIGH'
                    ? 'bg-amber-600 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                Risco {monteCarloResult.outOfStockRisk.riskLevel} de Ruptura
              </span>
              <span className="text-xs font-bold text-slate-700">
                Estoque Atual: {activeItemData.availableQuantity} unidades
              </span>
            </div>
            <p className="text-xs font-semibold mt-1">
              {monteCarloResult.outOfStockRisk.recommendation}
            </p>
          </div>
        </div>

        {/* Visual Progress Bar for Stockout Probability */}
        <div className="w-full md:w-64 space-y-1">
          <div className="flex justify-between text-[11px] font-bold">
            <span>Probabilidade de Esgotamento</span>
            <span>{monteCarloResult.outOfStockRisk.stockoutProbability}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                monteCarloResult.outOfStockRisk.stockoutProbability > 70
                  ? 'bg-red-600'
                  : monteCarloResult.outOfStockRisk.stockoutProbability > 40
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, monteCarloResult.outOfStockRisk.stockoutProbability)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Model Indicators Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
            <Layers className="w-4 h-4 text-blue-500" /> Delta Transição Estoque
          </div>
          <p className="text-xl font-bold text-slate-900 mt-2">
            {estimate.indicators.stockTransitionDelta} <span className="text-xs text-slate-500 font-normal">un/dia</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Transições de faixas de estoque observadas ({activeItemData.stockRange}).
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
            Ritmo diário de dúvidas enviadas por compradores.
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
            Frequência de novos comentários e avaliações.
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
            Peso do ranking de categoria segundo a Lei de Zipf.
          </p>
        </div>
      </div>

      {/* Monte Carlo Revenue Projections Chart */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Projeções Estocásticas Monte Carlo ({projectionHorizon} Dias)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Trajetória estocástica de faturamento com banda de confiança ({confidenceInterval}% CI) baseada em 1.000 simulações.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-xs bg-emerald-500" />
              <span className="text-slate-700">Faturamento Esperado (Mediana)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-xs bg-emerald-200 border border-emerald-400" />
              <span className="text-slate-700">Intervalo de Confiança ({confidenceInterval}%)</span>
            </div>
          </div>
        </div>

        <div className="h-88 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={monteCarloResult.dailyProjections}
              margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorFaturamentoUpper" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="dayLabel" stroke="#64748B" fontSize={12} tickLine={false} />
              <YAxis
                stroke="#64748B"
                fontSize={12}
                tickLine={false}
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#FFF' }}
                formatter={(val: any, name: any) => [
                  `R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                  name === 'upperBoundRevenue'
                    ? `Limite Superior (${confidenceInterval}%)`
                    : name === 'lowerBoundRevenue'
                    ? `Limite Inferior (${confidenceInterval}%)`
                    : 'Faturamento Esperado (Mediana)',
                ]}
              />
              <Area
                type="monotone"
                dataKey="upperBoundRevenue"
                stroke="#34D399"
                strokeWidth={1}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#colorFaturamentoUpper)"
                name="upperBoundRevenue"
              />
              <Area
                type="monotone"
                dataKey="medianRevenue"
                stroke="#059669"
                strokeWidth={3}
                fillOpacity={0}
                name="medianRevenue"
              />
              <Line
                type="monotone"
                dataKey="lowerBoundRevenue"
                stroke="#6EE7B7"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
                name="lowerBoundRevenue"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
