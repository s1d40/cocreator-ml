import React, { useState } from 'react';
import type { AdCampaign, AdDailyMetric } from '../data/mockData';
import { ReadOnlyBadge } from './ReadOnlyBadge';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { DollarSign, MousePointerClick, TrendingUp, Info, Play, Pause } from 'lucide-react';

interface AdsPerformanceProps {
  campaigns: AdCampaign[];
  dailyMetrics: AdDailyMetric[];
}

export const AdsPerformance: React.FC<AdsPerformanceProps> = ({ campaigns, dailyMetrics }) => {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'ytd'>('7d');

  const totalSpend = campaigns.reduce((acc, c) => acc + c.spent, 0);
  const totalSales = campaigns.reduce((acc, c) => acc + c.sales, 0);
  const totalImpressions = campaigns.reduce((acc, c) => acc + c.impressions, 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + c.clicks, 0);
  const avgAcos = (totalSpend / totalSales) * 100;
  const avgCtr = (totalClicks / totalImpressions) * 100;

  return (
    <div className="space-y-6">
      {/* Banner / Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">Ads Performance Dashboard</h2>
            <ReadOnlyBadge size="sm" label="Read-Only View" />
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Real-time campaign performance analytics, ad spend efficiency, and conversion tracking.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl text-xs font-medium">
          {(['7d', '30d', 'ytd'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1.5 rounded-lg uppercase font-semibold transition-colors ${
                timeframe === period ? 'bg-white text-blue-700 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>TOTAL AD SPEND</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-gray-900">${totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +12.4% vs previous period
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>AD GENERATED SALES</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-gray-900">${totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +18.2% vs previous period
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>AVERAGE ACoS</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Info className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-gray-900">{avgAcos.toFixed(2)}%</div>
          <p className="text-xs text-gray-500">Target ACoS: &lt; 10%</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>IMPRESSIONS & CLICKS</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-gray-900">{totalClicks.toLocaleString()}</div>
          <p className="text-xs text-gray-500">{totalImpressions.toLocaleString()} impressions ({avgCtr.toFixed(2)}% CTR)</p>
        </div>
      </div>

      {/* Recharts Performance Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Spend vs Sales Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Spend vs. Sales Revenue Trend</h3>
            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md font-medium">Daily</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} />
                <Tooltip
                  formatter={(value: any) => [
                    value !== undefined ? `$${Number(value).toLocaleString()}` : '',
                    ''
                  ]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0' }}
                />
                <Legend />
                <Area type="monotone" dataKey="sales" name="Sales ($)" stroke="#10b981" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
                <Area type="monotone" dataKey="spend" name="Spend ($)" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSpend)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Impressions & Clicks Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">Impressions & Clicks Volume</h3>
            <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md font-medium">Daily</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} />
                <Tooltip
                  formatter={(value: any) => [
                    value !== undefined ? Number(value).toLocaleString() : '',
                    ''
                  ]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0' }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="impressions" name="Impressions" fill="#8884d8" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="clicks" name="Clicks" fill="#82ca9d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">Active & Paused Campaigns</h3>
          <ReadOnlyBadge size="sm" label="Read-Only Table" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                <th className="p-4">Campaign Name</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Budget</th>
                <th className="p-4 text-right">Spent</th>
                <th className="p-4 text-right">Impressions</th>
                <th className="p-4 text-right">Clicks</th>
                <th className="p-4 text-right">CTR</th>
                <th className="p-4 text-right">Sales</th>
                <th className="p-4 text-right">ACoS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-4 font-bold text-gray-900 flex items-center gap-2">
                    {c.name}
                  </td>
                  <td className="p-4">
                    {c.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <Play className="w-3 h-3 fill-emerald-600" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        <Pause className="w-3 h-3 fill-amber-600" /> Paused
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">${c.budget.toLocaleString()}</td>
                  <td className="p-4 text-right">${c.spent.toFixed(2)}</td>
                  <td className="p-4 text-right">{c.impressions.toLocaleString()}</td>
                  <td className="p-4 text-right">{c.clicks.toLocaleString()}</td>
                  <td className="p-4 text-right">{c.ctr.toFixed(2)}%</td>
                  <td className="p-4 text-right font-bold text-emerald-700">${c.sales.toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      c.acos <= 10 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {c.acos.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
