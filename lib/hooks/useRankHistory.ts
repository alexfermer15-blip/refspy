// lib/hooks/useRankHistory.ts
import { useState, useEffect, useCallback } from 'react';
import { RankHistory } from '@/lib/types/rank-tracker';

interface UseRankHistoryOptions {
  keywordId: string;
  days?: number;
  limit?: number;
}

export function useRankHistory({
  keywordId,
  days = 30,
  limit = 100,
}: UseRankHistoryOptions) {
  const [history, setHistory] = useState<RankHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!keywordId) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        days: days.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(
        `/api/rank-tracker/history/${keywordId}?${params}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch rank history');
      }

      const data = await response.json();
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching rank history:', err);
    } finally {
      setLoading(false);
    }
  }, [keywordId, days, limit]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Вычисляем статистику
  const stats = {
    currentPosition: history[0]?.position || null,
    previousPosition: history[0]?.previous_position || null,
    change: history[0]?.position_change || null,
    bestPosition: history.reduce(
      (best, h) => (h.position && (!best || h.position < best) ? h.position : best),
      null as number | null
    ),
    worstPosition: history.reduce(
      (worst, h) => (h.position && (!worst || h.position > worst) ? h.position : worst),
      null as number | null
    ),
    averagePosition:
      history.length > 0
        ? history.reduce((sum, h) => sum + (h.position || 0), 0) / history.length
        : null,
  };

  return {
    history,
    stats,
    loading,
    error,
    refetch: fetchHistory,
  };
}
