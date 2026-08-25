import React from 'react';
import { HelpCircle, BarChart3, Award, Store } from 'lucide-react';
import { ReadOnlyBadge } from './ReadOnlyBadge';

export type TabType = 'questions' | 'ads' | 'seller';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  unansweredCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, unansweredCount }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg font-bold flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Seller Analytics Hub</h1>
              <p className="text-xs text-gray-500">Apex Tech Direct Dashboard</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('questions')}
              className={`flex items-center px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'questions'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              <span>Questions Inbox</span>
              {unansweredCount > 0 && (
                <span className="ml-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {unansweredCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('ads')}
              className={`flex items-center px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'ads'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              <span>Ads Performance</span>
            </button>

            <button
              onClick={() => setActiveTab('seller')}
              className={`flex items-center px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'seller'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              <Award className="w-4 h-4 mr-2" />
              <span>Seller Metrics</span>
            </button>
          </nav>

          {/* Global Read-Only Badge */}
          <div className="hidden md:flex items-center space-x-2">
            <ReadOnlyBadge size="md" />
          </div>
        </div>
      </div>
    </header>
  );
};
