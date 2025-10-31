'use client';

import { useState, useEffect } from 'react';

interface Competitor {
  domain: string;
  url: string;
  position: number;
  title: string;
  description: string;
  type: string;
}

interface Stats {
  success: boolean;
  quota: {
    used: number;
    limit: number;
    remaining: number;
    percentage: string;
  };
  cache: {
    size: number;
    keys: string[];
  };
  timestamp: string;
}

export default function TestParserPage() {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('us');
  const [resultsCount, setResultsCount] = useState(10);
  const [results, setResults] = useState<any>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  // Загружаем историю из localStorage
  useEffect(() => {
    const saved = localStorage.getItem('search-history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
    // Загружаем статистику при загрузке
    fetchStats();
  }, []);

  const analyzeCompetitors = async () => {
    if (!keyword.trim()) {
      setError('Please enter a keyword');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/parse/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          keyword, 
          location,
          competitorsCount: resultsCount 
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResults(data);
        await fetchStats();
        
        // Добавляем в историю
        if (!history.includes(keyword)) {
          const newHistory = [keyword, ...history.slice(0, 9)];
          setHistory(newHistory);
          localStorage.setItem('search-history', JSON.stringify(newHistory));
        }
      } else {
        setError(data.error || 'Failed to analyze competitors');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/parse/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const exportToCSV = () => {
    if (!results?.data) return;
    
    const csv = [
      ['Position', 'Domain', 'Title', 'URL', 'Description'],
      ...results.data.map((item: Competitor) => [
        item.position,
        item.domain,
        `"${item.title.replace(/"/g, '""')}"`,
        item.url,
        `"${item.description.replace(/"/g, '""')}"`,
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `refspy-competitors-${keyword.replace(/\s+/g, '-')}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('search-history');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🔍 RefSpy Parser
          </h1>
          <p className="text-gray-600">
            Analyze competitors and discover top-ranking pages for any keyword
          </p>
        </div>
        
        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keyword
            </label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Enter keyword (e.g., 'best running shoes')"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              onKeyDown={(e) => e.key === 'Enter' && analyzeCompetitors()}
            />
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <select 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="us">🇺🇸 United States</option>
                <option value="uk">🇬🇧 United Kingdom</option>
                <option value="ca">🇨🇦 Canada</option>
                <option value="au">🇦🇺 Australia</option>
                <option value="de">🇩🇪 Germany</option>
                <option value="fr">🇫🇷 France</option>
                <option value="es">🇪🇸 Spain</option>
                <option value="it">🇮🇹 Italy</option>
                <option value="ru">🇷🇺 Russia</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Results Count
              </label>
              <select 
                value={resultsCount}
                onChange={(e) => setResultsCount(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="5">5 results</option>
                <option value="10">10 results</option>
                <option value="20">20 results</option>
                <option value="50">50 results</option>
              </select>
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Recent Searches
                </label>
                <button
                  onClick={clearHistory}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {history.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setKeyword(item)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={analyzeCompetitors}
              disabled={loading}
              className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-md hover:shadow-lg"
            >
              {loading ? '🔄 Analyzing...' : '🚀 Analyze Competitors'}
            </button>
            
            <button
              onClick={fetchStats}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-all shadow-md hover:shadow-lg"
            >
              📊 Get Stats
            </button>

            {results && (
              <button
                onClick={exportToCSV}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-all shadow-md hover:shadow-lg"
              >
                📥 Export CSV
              </button>
            )}
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
              <span className="text-xl">❌</span>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Statistics */}
        {stats && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              📊 Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Google CSE Used</div>
                <div className="text-3xl font-bold text-blue-600">
                  {stats.quota.used} / {stats.quota.limit}
                </div>
                <div className="text-sm text-gray-500 mt-1">{stats.quota.percentage}</div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Cache Size</div>
                <div className="text-3xl font-bold text-green-600">
                  {stats.cache.size}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {stats.cache.keys.length} keys
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Remaining Quota</div>
                <div className="text-3xl font-bold text-purple-600">
                  {stats.quota.remaining}
                </div>
                <div className="text-sm text-gray-500 mt-1">requests left today</div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {results && results.data && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                🎯 Found {results.data.length} Competitors
              </h2>
              <div className="text-sm text-gray-500">
                for "{results.meta.keyword}" in {results.meta.location.toUpperCase()}
              </div>
            </div>
            
            <div className="space-y-4">
              {results.data.map((item: Competitor) => (
                <div 
                  key={item.position} 
                  className="p-5 border border-gray-200 rounded-lg hover:shadow-lg hover:border-blue-300 transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    {/* Position Badge */}
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center font-bold text-white shadow-md">
                      {item.position}
                    </div>
                    
                    {/* Favicon */}
                    <img 
                      src={`https://www.google.com/s2/favicons?domain=${item.domain}&sz=32`}
                      alt={item.domain}
                      className="w-8 h-8 rounded mt-1"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="%23ccc"/></svg>';
                      }}
                    />
                    
                    <div className="flex-1 min-w-0">
                      {/* Domain */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          {item.domain}
                        </span>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                          #{item.position}
                        </span>
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600 transition">
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {item.title}
                        </a>
                      </h3>
                      
                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {item.description}
                      </p>
                      
                      {/* URL */}
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 truncate max-w-full"
                      >
                        <span>🔗</span>
                        <span className="truncate">{item.url}</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Analyzed at: {new Date(results.meta.timestamp).toLocaleString()}</span>
                <span>Total results: {results.data.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!results && !loading && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Ready to analyze competitors
            </h3>
            <p className="text-gray-500">
              Enter a keyword above and click "Analyze Competitors" to get started
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Powered by Google Custom Search API • RefSpy Parser v1.0</p>
        </div>
      </div>
    </div>
  );
}
