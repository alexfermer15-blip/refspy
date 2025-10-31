'use client';

import Link from 'next/link';

export default function CompetitorsPage() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🎯 Competitors
            </h1>
            <p className="text-gray-600">
              Track and analyze your competitors across different keywords
            </p>
          </div>
          <Link
            href="/test-parser"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg"
          >
            + Add Competitors
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Competitors</div>
            <div className="text-3xl font-bold text-blue-600">0</div>
            <div className="text-xs text-gray-500 mt-1">Across all keywords</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Keywords Tracked</div>
            <div className="text-3xl font-bold text-green-600">0</div>
            <div className="text-xs text-gray-500 mt-1">Active tracking</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Avg Position</div>
            <div className="text-3xl font-bold text-purple-600">-</div>
            <div className="text-xs text-gray-500 mt-1">Your competitors</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Updated Today</div>
            <div className="text-3xl font-bold text-orange-600">0</div>
            <div className="text-xs text-gray-500 mt-1">Last 24 hours</div>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">
            No competitors tracked yet
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Start analyzing your competitors by adding keywords. Use our parser to discover who ranks for your target keywords.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/test-parser"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg"
            >
              🚀 Start Analyzing
            </Link>
            <Link
              href="/dashboard/keywords"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Manage Keywords
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
