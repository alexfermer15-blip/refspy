// lib/hooks/useKeywords.ts
import { useState, useEffect, useCallback } from 'react';
import { Keyword, KeywordWithHistory } from '@/lib/types/rank-tracker';

export function useKeywords(projectId?: string) {
  const [keywords, setKeywords] = useState<KeywordWithHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKeywords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (projectId) {
        params.append('project_id', projectId);
      }

      const response = await fetch(`/api/rank-tracker/keywords?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch keywords');
      }

      const data = await response.json();
      setKeywords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching keywords:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchKeywords();
  }, [fetchKeywords]);

  const addKeyword = async (keywordData: Partial<Keyword>) => {
    try {
      const response = await fetch('/api/rank-tracker/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(keywordData),
      });

      if (!response.ok) {
        throw new Error('Failed to add keyword');
      }

      const newKeyword = await response.json();
      setKeywords(prev => [newKeyword, ...prev]);
      return newKeyword;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add keyword');
    }
  };

  const updateKeyword = async (id: string, updates: Partial<Keyword>) => {
    try {
      const response = await fetch(`/api/rank-tracker/keywords/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update keyword');
      }

      const updatedKeyword = await response.json();
      setKeywords(prev =>
        prev.map(kw => (kw.id === id ? { ...kw, ...updatedKeyword } : kw))
      );
      return updatedKeyword;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update keyword');
    }
  };

  const deleteKeyword = async (id: string) => {
    try {
      const response = await fetch(`/api/rank-tracker/keywords/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete keyword');
      }

      setKeywords(prev => prev.filter(kw => kw.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete keyword');
    }
  };

  const toggleKeyword = async (id: string, isActive: boolean) => {
    return updateKeyword(id, { is_active: isActive });
  };

  return {
    keywords,
    loading,
    error,
    refetch: fetchKeywords,
    addKeyword,
    updateKeyword,
    deleteKeyword,
    toggleKeyword,
  };
}
