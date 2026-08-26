import React, { useState } from 'react';
import type { Question } from '../data/mockData';
import { ReadOnlyBadge } from './ReadOnlyBadge';
import { Search, Filter, MessageSquare, Clock, CheckCircle2, AlertCircle, Info, Send } from 'lucide-react';

interface QuestionsInboxProps {
  questions: Question[];
}

export const QuestionsInbox: React.FC<QuestionsInboxProps> = ({ questions }) => {
  const [filter, setFilter] = useState<'all' | 'unanswered' | 'answered'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(questions[0] || null);

  const filteredQuestions = questions.filter((q) => {
    const matchesFilter = filter === 'all' || q.status === filter;
    const matchesSearch =
      q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.productTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.buyerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
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
            <h2 className="text-2xl font-bold text-gray-900">Buyer Questions Inbox</h2>
            <ReadOnlyBadge size="sm" label="Read-Only View" />
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Monitor and review customer inquiries regarding products and specifications.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-2 rounded-xl">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Note: Answering questions is disabled in read-only mode.</span>
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
                placeholder="Search questions, products, buyers..."
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
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({questions.length})
              </button>
              <button
                onClick={() => setFilter('unanswered')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filter === 'unanswered'
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Unanswered ({questions.filter((q) => q.status === 'unanswered').length})
              </button>
              <button
                onClick={() => setFilter('answered')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filter === 'answered'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Answered ({questions.filter((q) => q.status === 'answered').length})
              </button>
            </div>
          </div>

          {/* List of Questions */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs divide-y divide-gray-100 overflow-hidden max-h-[600px] overflow-y-auto">
            {filteredQuestions.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                No questions found matching your filter criteria.
              </div>
            ) : (
              filteredQuestions.map((q) => {
                const isSelected = selectedQuestion?.id === q.id;
                return (
                  <div
                    key={q.id}
                    onClick={() => setSelectedQuestion(q)}
                    className={`p-4 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/70 border-l-4 border-blue-600' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-gray-500 truncate">{q.buyerName}</span>
                      {q.status === 'unanswered' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full shrink-0">
                          <AlertCircle className="w-3 h-3 text-amber-600" /> Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Answered
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">{q.productTitle}</h4>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{q.questionText}</p>

                    <div className="flex items-center justify-between text-[11px] text-gray-400 mt-3 pt-2 border-t border-gray-100">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatDate(q.createdAt)}
                      </span>
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px]">
                        {q.category}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Question View */}
        <div className="lg:col-span-7">
          {selectedQuestion ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-6 space-y-6">
              {/* Product Header */}
              <div className="flex items-start gap-4 pb-6 border-b border-gray-100">
                <img
                  src={selectedQuestion.productImage}
                  alt={selectedQuestion.productTitle}
                  className="w-16 h-16 object-cover rounded-xl border border-gray-200 shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      {selectedQuestion.category}
                    </span>
                    <span className="text-xs text-gray-400">• ID: {selectedQuestion.id}</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900">{selectedQuestion.productTitle}</h3>
                </div>
              </div>

              {/* Buyer Question Card */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                      {selectedQuestion.buyerName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{selectedQuestion.buyerName}</p>
                      <p className="text-[10px] text-gray-400">Verified Buyer</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(selectedQuestion.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed pl-1 font-medium">
                  "{selectedQuestion.questionText}"
                </p>
              </div>

              {/* Seller Answer Section */}
              {selectedQuestion.status === 'answered' ? (
                <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                        S
                      </div>
                      <div>
                        <p className="text-xs font-bold text-emerald-950">Apex Tech Direct (Seller Response)</p>
                        <p className="text-[10px] text-emerald-700">Official Seller</p>
                      </div>
                    </div>
                    {selectedQuestion.answeredAt && (
                      <span className="text-xs text-emerald-600">{formatDate(selectedQuestion.answeredAt)}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed pl-1">
                    {selectedQuestion.answerText}
                  </p>
                </div>
              ) : (
                <div className="bg-amber-50/50 rounded-2xl p-6 border border-amber-200/80 space-y-4">
                  <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
                    <MessageSquare className="w-4 h-4 text-amber-600" />
                    <span>Seller Response Box</span>
                  </div>

                  <div className="relative">
                    <textarea
                      disabled
                      rows={4}
                      placeholder="Type your response here..."
                      className="w-full p-3 bg-gray-100 border border-gray-300 rounded-xl text-sm text-gray-500 cursor-not-allowed focus:outline-none resize-none opacity-80"
                      value=""
                    />
                    <div className="absolute inset-0 bg-gray-50/60 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
                      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-xs border border-gray-200 text-xs font-semibold text-gray-700">
                        <ReadOnlyBadge size="sm" label="Form Read-Only" />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      disabled
                      className="flex items-center gap-2 bg-gray-300 text-gray-500 font-medium text-xs px-4 py-2 rounded-xl cursor-not-allowed opacity-75"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Answer (Disabled)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
              Select a question from the list to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
