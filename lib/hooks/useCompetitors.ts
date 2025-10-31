// lib/hooks/useCompetitors.ts
'use client'

import { useState, useEffect } from 'react'
import { competitorsAPI } from '@/lib/supabase'
import type { Competitor, CreateCompetitorData, CompetitorStats } from '@/lib/types'

export function useCompetitors(projectId?: string) {
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (projectId) {
      loadCompetitors(projectId)
    }
  }, [projectId])

  const loadCompetitors = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await competitorsAPI.getByProject(id)
      setCompetitors(data)
    } catch (err: any) {
      console.error('Error loading competitors:', err)
      setError(err.message || 'Failed to load competitors')
    } finally {
      setLoading(false)
    }
  }

  const createCompetitor = async (competitorData: CreateCompetitorData): Promise<Competitor | null> => {
    setError(null)
    try {
      const dataToCreate: Omit<Competitor, 'id' | 'created_at' | 'updated_at'> = {
        project_id: competitorData.project_id,
        domain: competitorData.domain,
        position: competitorData.position,
        url: competitorData.url,
        title: competitorData.title,
        description: competitorData.description,
        snippet: competitorData.snippet,
        dr: competitorData.dr,
        da: competitorData.da,
        backlinks_count: competitorData.backlinks_count || 0,
        referring_domains: competitorData.referring_domains || 0,
        organic_traffic: competitorData.organic_traffic,
        is_selected: competitorData.is_selected || false
      }
      
      const newCompetitor = await competitorsAPI.create(dataToCreate)
      if (newCompetitor) {
        setCompetitors(prev => [...prev, newCompetitor])
      }
      return newCompetitor
    } catch (err: any) {
      console.error('Error creating competitor:', err)
      setError(err.message || 'Failed to create competitor')
      return null
    }
  }

  const updateCompetitor = async (id: string, updates: Partial<Competitor>): Promise<Competitor | null> => {
    setError(null)
    try {
      const updated = await competitorsAPI.update(id, updates)
      if (updated) {
        setCompetitors(prev => prev.map(c => c.id === id ? updated : c))
      }
      return updated
    } catch (err: any) {
      console.error('Error updating competitor:', err)
      setError(err.message || 'Failed to update competitor')
      return null
    }
  }

  const deleteCompetitor = async (id: string): Promise<boolean> => {
    setError(null)
    try {
      await competitorsAPI.delete(id)
      setCompetitors(prev => prev.filter(c => c.id !== id))
      return true
    } catch (err: any) {
      console.error('Error deleting competitor:', err)
      setError(err.message || 'Failed to delete competitor')
      return false
    }
  }

  const toggleSelected = async (id: string, isSelected: boolean): Promise<boolean> => {
    setError(null)
    try {
      const updated = await competitorsAPI.update(id, { is_selected: isSelected })
      if (updated) {
        setCompetitors(prev => prev.map(c =>
          c.id === id ? { ...c, is_selected: isSelected } : c
        ))
      }
      return !!updated
    } catch (err: any) {
      console.error('Error toggling selection:', err)
      setError(err.message || 'Failed to toggle selection')
      return false
    }
  }

  const stats: CompetitorStats = {
    total: competitors.length,
    selected: competitors.filter(c => c.is_selected).length,
    avgDR: competitors.length > 0
      ? Math.round(competitors.reduce((sum, c) => sum + (c.dr || 0), 0) / competitors.length)
      : 0,
    avgPosition: competitors.length > 0
      ? Math.round(competitors.reduce((sum, c) => sum + c.position, 0) / competitors.length)
      : 0
  }

  return {
    competitors,
    loading,
    error,
    stats,
    createCompetitor,
    updateCompetitor,
    deleteCompetitor,
    toggleSelected,
    reload: () => projectId && loadCompetitors(projectId)
  }
}
