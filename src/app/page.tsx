'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Package,
  Search,
  Filter,
  RefreshCw,
  Key,
  Eye,
  X,
  Lock,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  Radar,
  HelpCircle,
  BarChart3,
  Award
} from 'lucide-react';
import { CompetitorRadar } from '@/components/CompetitorRadar';
import { QuestionsInbox } from '@/components/QuestionsInbox';
import { AdsPerformance } from '@/components/AdsPerformance';
import { SellerMetrics } from '@/components/SellerMetrics';
import { MOCK_COMPETITORS, MOCK_QUESTIONS, MOCK_CAMPAIGNS, MOCK_DAILY_METRICS, MOCK_SELLER_REPUTATION } from '@/data/mockData';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

interface MLOrderItem {
  item: {
    id: string;
    title: string;
    category_id?: string;
    seller_sku?: string;
  };
  quantity: number;
  unit_price: number;
  currency_id: string;
}

interface MLOrder {
  id: number | string;
  date_created: string;
  date_closed?: string;
  status: 'paid' | 'pending' | 'cancelled' | 'shipped' | 'delivered';
  status_detail?: string;
  total_amount: number;
  currency_id: string;
  buyer: {
    id: number | string;
    nickname: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  order_items: MLOrderItem[];
  payments?: Array<{
    id: number | string;
    transaction_amount: number;
    currency_id: string;
    status: string;
    payment_method_id?: string;
  }>;
  shipping?: {
    id?: number | string;
    status?: string;
    shipping_mode?: string;
  };
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'sales' | 'competitor' | 'questions' | 'ads' | 'seller'>('sales');
  const [orders, setOrders] = useState<MLOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'live' | 'mock'>('mock');
  const [tokenInput, setTokenInput] = useState('');
  const [tokenMsg, setTokenMsg] = useState('');
  const [hasToken, setHasToken] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('30days');

  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState<MLOrder | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const fetchTokenStatus = async () => {
    try {
      const res = await fetch('/api/ml-token');
      if (res.ok) {
        const data = await res.json();
        setHasToken(data.hasToken);
      }
    } catch (err) {
      console.error('Error fetching token status:', err);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ml-orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setDataSource(data.source || 'mock');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenStatus();
    fetchOrders();
  }, []);

  const handleSaveToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setTokenMsg('');
    try {
      const res = await fetch('/api/ml-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenInput }),
      });
      if (res.ok) {
        setTokenMsg('Token updated successfully!');
        setHasToken(!!tokenInput.trim());
        setShowTokenModal(false);
        fetchOrders();
      } else {
        setTokenMsg('Failed to update token.');
      }
    } catch {
      setTokenMsg('Error connecting to server.');
    }
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search term
      const searchLower = searchTerm.toLowerCase();
      const matchId = String(order.id).toLowerCase().includes(searchLower);
      const matchBuyer = order.buyer?.nickname?.toLowerCase().includes(searchLower) || '';
      const matchItems = order.order_items?.some((i) =>
        i.item.title?.toLowerCase().includes(searchLower)
      );
      const matchesSearch = !searchTerm || matchId || matchBuyer || matchItems;

      // Status filter
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

      // Date range filter
      let matchesDate = true;
      if (dateRangeFilter !== 'all') {
        const orderDate = new Date(order.date_created).getTime();
        const now = new Date().getTime();
        const days = dateRangeFilter === '7days' ? 7 : 30;
        matchesDate = now - orderDate <= days * 24 * 60 * 60 * 1000;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, searchTerm, statusFilter, dateRangeFilter]);

  // Key performance indicators (KPIs)
  const kpis = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total_amount : 0), 0);
    const validOrdersCount = filteredOrders.filter((o) => o.status !== 'cancelled').length;
    const avgOrderValue = validOrdersCount > 0 ? totalRevenue / validOrdersCount : 0;
    const unitsSold = filteredOrders.reduce(
      (sum, o) => sum + (o.status !== 'cancelled' ? o.order_items.reduce((s, i) => s + i.quantity, 0) : 0),
      0
    );

    return {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      unitsSold,
    };
  }, [filteredOrders]);

  // Chart Data: Revenue Trend over Time
  const revenueTrendData = useMemo(() => {
    const map: { [key: string]: number } = {};
    const sorted = [...filteredOrders].sort(
      (a, b) => new Date(a.date_created).getTime() - new Date(b.date_created).getTime()
    );

    sorted.forEach((order) => {
      if (order.status === 'cancelled') return;
      const dateStr = new Date(order.date_created).toLocaleDateString('es-ES', {
        month: 'short',
        day: 'numeric',
      });
      map[dateStr] = (map[dateStr] || 0) + order.total_amount;
    });

    return Object.keys(map).map((date) => ({
      date,
      Revenue: Number(map[date].toFixed(2)),
    }));
  }, [filteredOrders]);

  // Chart Data: Status Distribution
  const statusDistributionData = useMemo(() => {
    const counts: { [key: string]: number } = {};
    filteredOrders.forEach((order) => {
      counts[order.status] = (counts[order.status] || 0) + 1;
    });
    return Object.keys(counts).map((status) => ({
      name: status.toUpperCase(),
      value: counts[status],
    }));
  }, [filteredOrders]);

  // Chart Data: Top Selling Products
  const topProductsData = useMemo(() => {
    const productMap: { [key: string]: { name: string; sales: number; units: number } } = {};
    filteredOrders.forEach((order) => {
      if (order.status === 'cancelled') return;
      order.order_items.forEach((item) => {
        const title = item.item.title;
        if (!productMap[title]) {
          productMap[title] = { name: title.length > 20 ? title.substring(0, 20) + '...' : title, sales: 0, units: 0 };
        }
        productMap[title].sales += item.unit_price * item.quantity;
        productMap[title].units += item.quantity;
      });
    });
    return Object.values(productMap)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [filteredOrders]);

  // Paginated Orders Table
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> {status.toUpperCase()}
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <Truck className="w-3 h-3" /> SHIPPED
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" /> PENDING
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" /> CANCELLED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            {status.toUpperCase()}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-span mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-400 p-2 rounded-lg text-slate-900 font-bold flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Mercado Libre Sales Dashboard
              </h1>
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <Lock className="w-3 h-3 text-slate-400" /> Read-Only Mode &bull; API Integration
              </p>
            </div>
          </div>

          {/* Main navigation tabs */}
          <nav className="hidden lg:flex space-x-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('sales')}
              className={`flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'sales'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
              <span>Sales Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('competitor')}
              className={`flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'competitor'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Radar className="w-3.5 h-3.5 mr-1.5" />
              <span>Competitor Radar</span>
            </button>

            <button
              onClick={() => setActiveTab('questions')}
              className={`flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'questions'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
              <span>Questions</span>
            </button>

            <button
              onClick={() => setActiveTab('ads')}
              className={`flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'ads'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
              <span>Ads</span>
            </button>

            <button
              onClick={() => setActiveTab('seller')}
              className={`flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'seller'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Award className="w-3.5 h-3.5 mr-1.5" />
              <span>Seller Metrics</span>
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                dataSource === 'live'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              Data Source: {dataSource === 'live' ? 'Live ML API' : 'Demo Dataset'}
            </span>

            <button
              onClick={() => setShowTokenModal(true)}
              className="flex items-center gap-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md font-medium transition"
            >
              <Key className="w-4 h-4" />
              {hasToken ? 'Update ML Token' : 'Set ML Token'}
            </button>

            <button
              onClick={fetchOrders}
              disabled={loading}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition"
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Mobile Navigation Dropdown */}
        <div className="block lg:hidden bg-white p-2 rounded-xl border border-slate-200">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as any)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-800"
          >
            <option value="sales">🛍️ Sales Dashboard</option>
            <option value="competitor">🎯 Competitor Radar &amp; Buy Box</option>
            <option value="questions">❓ Questions Inbox</option>
            <option value="ads">📊 Ads Performance</option>
            <option value="seller">🏆 Seller Metrics</option>
          </select>
        </div>

        {activeTab === 'competitor' && (
          <CompetitorRadar initialCompetitors={MOCK_COMPETITORS} />
        )}

        {activeTab === 'questions' && (
          <QuestionsInbox questions={MOCK_QUESTIONS} />
        )}

        {activeTab === 'ads' && (
          <AdsPerformance campaigns={MOCK_CAMPAIGNS} dailyMetrics={MOCK_DAILY_METRICS} />
        )}

        {activeTab === 'seller' && (
          <SellerMetrics sellerData={MOCK_SELLER_REPUTATION} />
        )}

        {activeTab === 'sales' && (
          <>
        {showTokenModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
              <button
                onClick={() => setShowTokenModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-yellow-500" /> Mercado Libre Access Token
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Provide your API access token to fetch real live orders from your Mercado Libre seller account via <code>/api/ml-token</code>.
              </p>
              <form onSubmit={handleSaveToken} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Access Token
                  </label>
                  <input
                    type="password"
                    placeholder="APP_USR-..."
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                {tokenMsg && <p className="text-xs font-medium text-emerald-600">{tokenMsg}</p>}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTokenModal(false)}
                    className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold rounded-md shadow-sm"
                  >
                    Save Token
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filters and Controls */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Order ID, Buyer, Product..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="delivered">Delivered</option>
                <option value="shipped">Shipped</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <select
                value={dateRangeFilter}
                onChange={(e) => {
                  setDateRangeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </section>

        {/* KPI Metrics Summary */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Revenue
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                ${kpis.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Orders
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{kpis.totalOrders}</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Avg Order Value
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                ${kpis.avgOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Units Sold
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{kpis.unitsSold}</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Trend AreaChart */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4">Sales &amp; Revenue Trend</h3>
            <div className="h-72 w-full">
              {revenueTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="date" stroke="#64748B" fontSize={12} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', color: '#FFF' }}
                      formatter={(val) => [`$${Number(val || 0).toFixed(2)}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="Revenue" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  No sales data available for selected filter range.
                </div>
              )}
            </div>
          </div>

          {/* Status Breakdown PieChart */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4">Order Status Breakdown</h3>
            <div className="h-72 w-full">
              {statusDistributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', color: '#FFF' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  No order data.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Top Selling Products BarChart */}
        <section className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4">Top Selling Products (by Sales $)</h3>
          <div className="h-64 w-full">
            {topProductsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={12} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', color: '#FFF' }} />
                  <Bar dataKey="sales" fill="#10B981" radius={[4, 4, 0, 0]} name="Sales ($)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No product sales data.
              </div>
            )}
          </div>
        </section>

        {/* Read-Only Orders Table */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Orders Explorer</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing {filteredOrders.length} orders (Read-only view)
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Order ID</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Buyer</th>
                  <th className="px-6 py-3.5">Items</th>
                  <th className="px-6 py-3.5">Total Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      Loading orders...
                    </td>
                  </tr>
                ) : paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      No orders matching current criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 font-medium text-slate-900">#{order.id}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(order.date_created).toLocaleString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {order.buyer?.nickname || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs truncate text-xs text-slate-700">
                          {order.order_items?.map((i) => `${i.quantity}x ${i.item.title}`).join(', ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        ${order.total_amount.toFixed(2)} {order.currency_id}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md transition"
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-xs border border-slate-200 rounded-md disabled:opacity-50 hover:bg-slate-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-xs border border-slate-200 rounded-md disabled:opacity-50 hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
        </>
        )}
      </main>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
              <ShoppingBag className="w-6 h-6 text-yellow-500" />
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Order Details #{selectedOrder.id}
                </h3>
                <p className="text-xs text-slate-500">
                  Created on {new Date(selectedOrder.date_created).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-6">
              {/* Order summary info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Status</span>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Buyer Nickname</span>
                  <span className="font-semibold text-slate-800 mt-1 block">
                    {selectedOrder.buyer?.nickname}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Total Amount</span>
                  <span className="font-semibold text-slate-900 mt-1 block">
                    ${selectedOrder.total_amount.toFixed(2)} {selectedOrder.currency_id}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Purchased Items
                </h4>
                <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                  {selectedOrder.order_items?.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs bg-white">
                      <div>
                        <p className="font-semibold text-slate-800">{item.item.title}</p>
                        <p className="text-slate-400 mt-0.5">
                          ID: {item.item.id} {item.item.seller_sku ? `| SKU: ${item.item.seller_sku}` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">
                          {item.quantity} x ${item.unit_price.toFixed(2)}
                        </p>
                        <p className="text-slate-500 font-medium">
                          ${(item.quantity * item.unit_price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Details */}
              {selectedOrder.payments && selectedOrder.payments.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Payment Info
                  </h4>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1">
                    {selectedOrder.payments.map((p, idx) => (
                      <div key={idx} className="flex justify-between items-center text-slate-700">
                        <span>
                          Payment ID: {p.id} ({p.payment_method_id || 'card'})
                        </span>
                        <span className="font-semibold text-emerald-700 uppercase">
                          {p.status} - ${p.transaction_amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end border-t border-slate-200 pt-4">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
