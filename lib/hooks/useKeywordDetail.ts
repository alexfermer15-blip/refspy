// lib/hooks/useKeywordDetail.ts
import { useState, useEffect, useCallback } from 'react';
import { KeywordWithHistory } from '@/lib/types/rank-tracker';

export function useKeywordDetail(keywordId: string | null) {
  const [keyword, setKeyword] = useState<KeywordWithHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKeyword = useCallback(async () => {
    if (!keywordId) {
      setKeyword(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/rank-tracker/keywords/${keywordId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch keyword');
      }

      const data = await response.json();
      setKeyword(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching keyword:', err);
    } finally {
      setLoading(false);
    }
  }, [keywordId]);

  useEffect(() => {
    fetchKeyword();
  }, [fetchKeyword]);

  return {
    keyword,
    loading,
    error,
    refetch: fetchKeyword,
  };
}
