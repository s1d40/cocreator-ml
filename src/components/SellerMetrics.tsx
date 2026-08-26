import React from 'react';
import type { SellerReputation } from '../data/mockData';
import { ReadOnlyBadge } from './ReadOnlyBadge';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { Award, Star, CheckCircle, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';

interface SellerMetricsProps {
  sellerData: SellerReputation;
}

export const SellerMetrics: React.FC<SellerMetricsProps> = ({ sellerData }) => {
  const ratingColors = ['#10b981', '#3b82f6', '#f59e0b', '#f97316', '#ef4444'];

  const completionRate = (
    (sellerData.completedOrders / sellerData.totalOrders) *
    100
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Page Header / Banner */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">Seller Reputation & Metrics</h2>
            <ReadOnlyBadge size="sm" label="Read-Only View" />
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Store performance standards, buyer feedback distribution, and account status overview.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-2 rounded-xl font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Account Health: Excellent (Top Rated)</span>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>REPUTATION SCORE</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{sellerData.reputationScore}%</div>
          <p className="text-xs text-emerald-600 font-medium">Top 2% among tech merchants</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>FULFILLMENT RATE</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{completionRate}%</div>
          <p className="text-xs text-gray-500">{sellerData.completedOrders.toLocaleString()} / {sellerData.totalOrders.toLocaleString()} orders</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>AVG RESPONSE TIME</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{sellerData.responseTimeHours}h</div>
          <p className="text-xs text-emerald-600 font-medium">{sellerData.responseRate}% response rate</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>BUYER CLAIM RATE</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{sellerData.claimRate}%</div>
          <p className="text-xs text-emerald-600 font-medium">Well below 1.0% threshold</p>
        </div>
      </div>

      {/* Historical Performance & Rating Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recharts Line Chart: 6-Month Reputation Trend */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Historical Reputation Trend</h3>
              <p className="text-xs text-gray-500">6-month score progression and monthly completed sales</p>
            </div>
            <ReadOnlyBadge size="sm" label="Read-Only Chart" />
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sellerData.monthlyPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} />
                <YAxis yAxisId="score" domain={[90, 100]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} />
                <YAxis yAxisId="sales" orientation="right" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0' }}
                />
                <Legend />
                <Line
                  yAxisId="score"
                  type="monotone"
                  dataKey="score"
                  name="Reputation Score (%)"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#3b82f6' }}
                />
                <Line
                  yAxisId="sales"
                  type="monotone"
                  dataKey="salesCount"
                  name="Sales Volume"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recharts Bar Chart: Customer Rating Distribution */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Rating Breakdown</h3>
              <p className="text-xs text-gray-500">Feedback from verified purchases</p>
            </div>
            <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>4.8 / 5.0</span>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={sellerData.ratingBreakdown} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} />
                <YAxis dataKey="stars" type="category" tickFormatter={(val) => `${val} ★`} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} />
                <Tooltip
                  formatter={(value: any) => [
                    value !== undefined ? `${value} reviews` : '',
                    'Count'
                  ]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0' }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {sellerData.ratingBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={ratingColors[index % ratingColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Canceled Orders: <strong className="text-gray-800">{sellerData.canceledOrdersBySeller}</strong></span>
            <span>Claims: <strong className="text-gray-800">1</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
