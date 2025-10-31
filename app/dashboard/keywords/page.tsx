'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function KeywordsPage() {
  const [keyword, setKeyword] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);

  const addKeyword = () => {
    if (keyword.trim() && !keywords.includes(keyword.trim())) {
      setKeywords([...keywords, keyword.trim()]);
      setKeyword('');
    }
  };

  const removeKeyword = (kw: string) => {
    setKeywords(keywords.filter(k => k !== kw));
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">🔑 Keywords Management</h1>
        <p className="text-gray-600 mb-8">
          Add and manage keywords to track competitor rankings
        </p>

        {/* Add Keyword Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Keyword</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Enter keyword (e.g., 'best seo tools')"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
            />
            <button
              onClick={addKeyword}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              + Add
            </button>
          </div>
        </div>

        {/* Keywords List */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              Tracked Keywords ({keywords.length})
            </h2>
            {keywords.length > 0 && (
              <Link
                href="/test-parser"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Analyze All →
              </Link>
            )}
          </div>
          
          {keywords.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-3">📝</div>
              <p>No keywords added yet. Add your first keyword above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {keywords.map((kw, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 font-mono text-sm">#{index + 1}</span>
                    <span className="font-medium">{kw}</span>
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      Not analyzed
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/test-parser?keyword=${encodeURIComponent(kw)}`}
                      className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                    >
                      Analyze
                    </Link>
                    <button
                      onClick={() => removeKeyword(kw)}
                      className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
