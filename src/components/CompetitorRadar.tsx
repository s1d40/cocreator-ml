import React, { useState } from 'react';
import {
  Radar,
  Search,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  Trophy,
  AlertTriangle,
  XCircle,
  Truck,
  Zap,
  Award,
  Trash2,
  LineChart as LineChartIcon,
  ExternalLink,
  ShieldCheck,
  Package,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { CompetitorItem } from '../types/competitor';
import { ReadOnlyBadge } from './ReadOnlyBadge';

interface CompetitorRadarProps {
  initialCompetitors: CompetitorItem[];
}

export const CompetitorRadar: React.FC<CompetitorRadarProps> = ({ initialCompetitors }) => {
  const [competitors, setCompetitors] = useState<CompetitorItem[]>(initialCompetitors);
  const [searchInput, setSearchInput] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedChartItem, setSelectedChartItem] = useState<CompetitorItem | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  // Parse MLB ID from URL or raw ID string (e.g. MLB123456789 or https://produto.mercadolivre.com.br/MLB-123456789-...)
  const extractMlbId = (input: string): string | null => {
    const cleaned = input.trim();
    const match = cleaned.match(/MLB-?(\d+)/i);
    if (match) {
      return `MLB${match[1]}`;
    }
    return null;
  };

  const handleAddCompetitor = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddSuccess(null);

    if (!searchInput.trim()) return;

    const mlbId = extractMlbId(searchInput);
    if (!mlbId) {
      setAddError('URL ou ID inválido. Use um formato como MLB123456789 ou o link do anúncio no Mercado Livre.');
      return;
    }

    if (competitors.some((c) => c.mlbId.toUpperCase() === mlbId.toUpperCase())) {
      setAddError(`O anúncio ${mlbId} já está sendo monitorado no seu radar.`);
      return;
    }

    // Generate mock competitor item for newly added MLB ID
    const newItem: CompetitorItem = {
      id: `comp-${Date.now()}`,
      mlbId,
      title: `Produto Mercado Livre (${mlbId})`,
      sellerNickname: 'VENDEDOR_PARCEIRO',
      sellerReputation: 'gold',
      price: Math.floor(Math.random() * 200) + 99.9,
      listingType: 'gold_pro',
      shippingType: 'fulfillment',
      buyBoxStatus: 'competing',
      thumbnail: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=150&q=80',
      stockRange: 'RANGO_6_25',
      lastUpdated: new Date().toISOString(),
      priceHistory: [
        { date: '19 Aug', price: 180.0 },
        { date: '21 Aug', price: 175.0 },
        { date: '23 Aug', price: 169.9 },
        { date: '25 Aug', price: 159.9 },
      ],
    };

    setCompetitors([newItem, ...competitors]);
    setSearchInput('');
    setAddSuccess(`Anúncio ${mlbId} adicionado ao radar com sucesso!`);
    setTimeout(() => setAddSuccess(null), 4000);
  };

  const handleRemoveCompetitor = (id: string) => {
    setCompetitors(competitors.filter((c) => c.id !== id));
    if (selectedChartItem?.id === id) {
      setSelectedChartItem(null);
    }
  };

  // Helper formatting for Seller Reputation
  const renderReputationBadge = (reputation: CompetitorItem['sellerReputation']) => {
    switch (reputation) {
      case 'platinum':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <ShieldCheck className="w-3 h-3 text-emerald-600" /> Platinum
          </span>
        );
      case 'gold':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <Award className="w-3 h-3 text-amber-600" /> MercadoLíder Gold
          </span>
        );
      case 'leader':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <Award className="w-3 h-3 text-blue-600" /> MercadoLíder
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            Sem Medalha
          </span>
        );
    }
  };

  // Helper formatting for Shipping Type
  const renderShippingBadge = (shippingType: CompetitorItem['shippingType']) => {
    switch (shippingType) {
      case 'fulfillment':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-yellow-300 text-slate-900 border border-yellow-400">
            <Zap className="w-3 h-3 fill-slate-900" /> FULL
          </span>
        );
      case 'cross_docking':
      case 'xd_drop_off':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-300">
            <Truck className="w-3 h-3 text-blue-700" /> FLEX
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <Package className="w-3 h-3" /> Normal
          </span>
        );
    }
  };

  // Helper formatting for Buy Box Status
  const renderBuyBoxBadge = (status: CompetitorItem['buyBoxStatus']) => {
    switch (status) {
      case 'winning':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
            <Trophy className="w-3.5 h-3.5 text-emerald-600" /> 🏆 Ganhando
          </span>
        );
      case 'competing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> ⚠️ Concorrendo
          </span>
        );
      case 'lost':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300 shadow-xs">
            <XCircle className="w-3.5 h-3.5 text-red-600" /> ❌ Perdendo
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            ➖ N/A
          </span>
        );
    }
  };

  // Helper for Price Variation Trend
  const getPriceTrend = (item: CompetitorItem) => {
    const history = item.priceHistory;
    if (!history || history.length < 2) return { trend: 'stable', text: 'Estável', pct: 0 };

    const current = history[history.length - 1].price;
    const previous = history[history.length - 2].price;

    if (current > previous) {
      const pct = (((current - previous) / previous) * 100).toFixed(1);
      return { trend: 'up', text: `+${pct}%`, pct: Number(pct) };
    } else if (current < previous) {
      const pct = (((previous - current) / previous) * 100).toFixed(1);
      return { trend: 'down', text: `-${pct}%`, pct: Number(pct) };
    }
    return { trend: 'stable', text: 'Estável', pct: 0 };
  };

  const renderStockRange = (range: string) => {
    switch (range) {
      case 'RANGO_1_5':
        return <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">1 - 5 un.</span>;
      case 'RANGO_6_25':
        return <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">6 - 25 un.</span>;
      case 'RANGO_26_50':
        return <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">26 - 50 un.</span>;
      case 'RANGO_51_100':
      default:
        return <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">+50 un.</span>;
    }
  };

  // Summary Metrics
  const totalTracked = competitors.length;
  const winningCount = competitors.filter((c) => c.buyBoxStatus === 'winning').length;
  const competingCount = competitors.filter((c) => c.buyBoxStatus === 'competing').length;
  const lostCount = competitors.filter((c) => c.buyBoxStatus === 'lost').length;

  const winRate = totalTracked > 0 ? ((winningCount / totalTracked) * 100).toFixed(1) : '0';

  // Filtered list
  const filteredCompetitors = competitors.filter((item) => {
    const matchesQuery =
      item.title.toLowerCase().includes(filterSearch.toLowerCase()) ||
      item.sellerNickname.toLowerCase().includes(filterSearch.toLowerCase()) ||
      item.mlbId.toLowerCase().includes(filterSearch.toLowerCase());

    const matchesStatus = statusFilter === 'all' || item.buyBoxStatus === statusFilter;

    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Radar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Competitor Radar &amp; Buy Box Monitor</h2>
              <p className="text-xs text-slate-500">
                Monitore anúncios concorrentes do Mercado Livre, acompanhe histórico de preços e alertas de Buy Box em tempo real.
              </p>
            </div>
          </div>
        </div>
        <ReadOnlyBadge size="md" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Taxa de Vitória Buy Box
            </p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{winRate}%</p>
            <p className="text-xs text-slate-500 mt-0.5">{winningCount} de {totalTracked} anúncios</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Buy Box em Disputa
            </p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{competingCount}</p>
            <p className="text-xs text-slate-500 mt-0.5">Necessita ajuste de preço</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Buy Box Perdida
            </p>
            <p className="text-2xl font-bold text-red-600 mt-1">{lostCount}</p>
            <p className="text-xs text-slate-500 mt-0.5">Atenção requerida</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <XCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total de Concorrentes
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalTracked}</p>
            <p className="text-xs text-slate-500 mt-0.5">Anúncios monitorados</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Radar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Buy Box Win/Loss Alerts Monitor */}
      {lostCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-900">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-sm text-red-800">Alerta de Perda de Buy Box!</h4>
            <p className="mt-0.5 text-red-700">
              Você perdeu a Buy Box em <strong>{lostCount} anúncio(s)</strong> monitorado(s). Verifique as alterações de preço dos seus concorrentes e ajuste seu valor para recuperar a posição de destaque.
            </p>
          </div>
        </div>
      )}

      {/* Add New Competitor Form & Table Filters */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
            Adicionar Anúncio ao Radar
          </h3>
          <form onSubmit={handleAddCompetitor} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cole a URL ou ID do anúncio Mercado Livre (ex: MLB123456789 ou https://produto.mercadolivre.com.br/MLB-...)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition shadow-xs"
            >
              <Plus className="w-4 h-4" /> Monitorar Anúncio
            </button>
          </form>

          {addError && <p className="text-xs text-red-600 font-medium mt-2">{addError}</p>}
          {addSuccess && <p className="text-xs text-emerald-600 font-medium mt-2">{addSuccess}</p>}
        </div>

        <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Table Search Filter */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por título, vendedor ou ID..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Dropdown Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Status Buy Box:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os Status</option>
              <option value="winning">🏆 Ganhando</option>
              <option value="competing">⚠️ Concorrendo</option>
              <option value="lost">❌ Perdendo</option>
              <option value="not_applicable">➖ N/A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Competitor Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Tabela de Comparação de Concorrentes ({filteredCompetitors.length})
          </h3>
          <span className="text-xs text-slate-500">Preços atualizados em tempo real</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Anúncio</th>
                <th className="px-6 py-3.5">Vendedor &amp; Medalha</th>
                <th className="px-6 py-3.5">Preço &amp; Tipo</th>
                <th className="px-6 py-3.5">Envio</th>
                <th className="px-6 py-3.5">Status Buy Box</th>
                <th className="px-6 py-3.5">Tendência</th>
                <th className="px-6 py-3.5">Estoque Estimado</th>
                <th className="px-6 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCompetitors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    Nenhum concorrente encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredCompetitors.map((item) => {
                  const priceTrend = getPriceTrend(item);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      {/* Product details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-12 h-12 object-cover rounded-md border border-slate-200 shrink-0"
                          />
                          <div className="max-w-xs">
                            <p className="font-semibold text-slate-900 line-clamp-2 text-xs leading-tight">
                              {item.title}
                            </p>
                            <a
                              href={`https://produto.mercadolivre.com.br/${item.mlbId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1 mt-0.5 font-mono"
                            >
                              {item.mlbId} <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* Seller info */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="font-semibold text-slate-800 text-xs">{item.sellerNickname}</p>
                          <div>{renderReputationBadge(item.sellerReputation)}</div>
                        </div>
                      </td>

                      {/* Price & Listing type */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            R$ {item.price.toFixed(2)}
                          </p>
                          {item.originalPrice && (
                            <p className="text-[11px] text-slate-400 line-through">
                              R$ {item.originalPrice.toFixed(2)}
                            </p>
                          )}
                          <span className="inline-block mt-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded">
                            {item.listingType === 'gold_pro' ? 'Premium (Pro)' : 'Clássico'}
                          </span>
                        </div>
                      </td>

                      {/* Shipping Badge */}
                      <td className="px-6 py-4">{renderShippingBadge(item.shippingType)}</td>

                      {/* Buy Box Indicator */}
                      <td className="px-6 py-4">{renderBuyBoxBadge(item.buyBoxStatus)}</td>

                      {/* Price variation trend */}
                      <td className="px-6 py-4">
                        {priceTrend.trend === 'up' && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                            <TrendingUp className="w-3.5 h-3.5" /> 📈 Subiu ({priceTrend.text})
                          </span>
                        )}
                        {priceTrend.trend === 'down' && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <TrendingDown className="w-3.5 h-3.5" /> 📉 Caiu ({priceTrend.text})
                          </span>
                        )}
                        {priceTrend.trend === 'stable' && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            <Minus className="w-3.5 h-3.5" /> Estável
                          </span>
                        )}
                      </td>

                      {/* Stock Range */}
                      <td className="px-6 py-4">{renderStockRange(item.stockRange)}</td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedChartItem(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded transition border border-blue-200"
                          title="Ver histórico de preços"
                        >
                          <LineChartIcon className="w-3.5 h-3.5" /> Histórico
                        </button>
                        <button
                          onClick={() => handleRemoveCompetitor(item.id)}
                          className="inline-flex items-center gap-1 p-1 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded transition"
                          title="Remover do radar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Mini Price History Chart Modal/Panel */}
      {selectedChartItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 relative">
            <button
              onClick={() => setSelectedChartItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                <LineChartIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Histórico de Preços: {selectedChartItem.mlbId}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-1">{selectedChartItem.title}</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500">Vendedor:</span>{' '}
                  <span className="font-bold text-slate-800">{selectedChartItem.sellerNickname}</span>
                </div>
                <div>
                  <span className="text-slate-500">Preço Atual:</span>{' '}
                  <span className="font-bold text-slate-900 text-sm">
                    R$ {selectedChartItem.price.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Status Buy Box:</span>{' '}
                  <span>{renderBuyBoxBadge(selectedChartItem.buyBoxStatus)}</span>
                </div>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={selectedChartItem.priceHistory} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="date" stroke="#64748B" fontSize={12} tickLine={false} />
                    <YAxis
                      stroke="#64748B"
                      fontSize={12}
                      tickLine={false}
                      domain={['auto', 'auto']}
                      tickFormatter={(val) => `R$${val}`}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', color: '#FFF' }}
                      formatter={(val) => [`R$ ${Number(val || 0).toFixed(2)}`, 'Preço']}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#2563EB"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#2563EB' }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-6 flex justify-end border-t border-slate-200 pt-4">
              <button
                onClick={() => setSelectedChartItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
