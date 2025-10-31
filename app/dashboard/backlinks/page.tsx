'use client';

import { useState } from 'react';

export default function BacklinksPage() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);

  const analyzeBacklinks = async () => {
    if (!domain.trim()) return;
    
    setLoading(true);
    setTimeout(() => {
      alert('Backlink analysis coming soon!');
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">🔗 Backlinks Analysis</h1>
        <p className="text-gray-600 mb-8">
          Analyze backlink profiles of your competitors
        </p>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="Enter domain (e.g., example.com)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              onKeyDown={(e) => e.key === 'Enter' && analyzeBacklinks()}
            />
            <button
              onClick={analyzeBacklinks}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? '🔄 Analyzing...' : '🔍 Analyze'}
            </button>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            Backlinks Analysis Coming Soon
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            We're working hard to integrate powerful backlink analysis tools. This feature will help you discover and analyze competitor backlinks.
          </p>
          <div className="flex justify-center gap-4">
            <div className="px-6 py-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600">Development Status</div>
              <div className="font-semibold text-blue-600 mt-1">In Progress</div>
            </div>
            <div className="px-6 py-4 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600">Expected Launch</div>
              <div className="font-semibold text-green-600 mt-1">Q1 2026</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
