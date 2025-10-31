// lib/hooks/useBacklinks.ts
'use client'

import { useState, useEffect } from 'react'
import { backlinksAPI } from '@/lib/supabase'
import type { Backlink, SortOrder, BacklinkStats } from '@/lib/types'

export function useBacklinks(projectId?: string) {
  const [backlinks, setBacklinks] = useState<Backlink[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'dr' | 'domain' | 'anchor'>('dr')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  useEffect(() => {
    if (projectId) {
      loadBacklinks(projectId)
    }
  }, [projectId])

  const loadBacklinks = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await backlinksAPI.getByProject(id)
      setBacklinks(data)
    } catch (err: any) {
      console.error('Error loading backlinks:', err)
      setError(err.message || 'Failed to load backlinks')
    } finally {
      setLoading(false)
    }
  }

  const createBacklink = async (backlinkData: Partial<Backlink>): Promise<Backlink | null> => {
    setError(null)
    try {
      const dataToCreate: Omit<Backlink, 'id' | 'created_at'> = {
        project_id: backlinkData.project_id!,
        competitor_id: backlinkData.competitor_id,
        source_domain: backlinkData.source_domain!,
        source_url: backlinkData.source_url!,
        target_url: backlinkData.target_url!,
        anchor_text: backlinkData.anchor_text,
        link_type: backlinkData.link_type || 'dofollow',
        dr: backlinkData.dr,
        da: backlinkData.da,
        traffic: backlinkData.traffic,
        spam_score: backlinkData.spam_score,
        is_available: backlinkData.is_available ?? true,
        discovered_at: backlinkData.discovered_at || new Date().toISOString(),
        checked_at: backlinkData.checked_at
      }
      
      const newBacklink = await backlinksAPI.create(dataToCreate)
      if (newBacklink) {
        setBacklinks(prev => [...prev, newBacklink])
      }
      return newBacklink
    } catch (err: any) {
      console.error('Error creating backlink:', err)
      setError(err.message || 'Failed to create backlink')
      return null
    }
  }

  const updateBacklink = async (id: string, updates: Partial<Backlink>): Promise<Backlink | null> => {
    setError(null)
    try {
      const updated = await backlinksAPI.update(id, updates)
      if (updated) {
        setBacklinks(prev => prev.map(b => b.id === id ? updated : b))
      }
      return updated
    } catch (err: any) {
      console.error('Error updating backlink:', err)
      setError(err.message || 'Failed to update backlink')
      return null
    }
  }

  const deleteBacklink = async (id: string): Promise<boolean> => {
    setError(null)
    try {
      await backlinksAPI.delete(id)
      setBacklinks(prev => prev.filter(b => b.id !== id))
      return true
    } catch (err: any) {
      console.error('Error deleting backlink:', err)
      setError(err.message || 'Failed to delete backlink')
      return false
    }
  }

  const stats: BacklinkStats = {
    total: backlinks.length,
    dofollow: backlinks.filter(b => b.link_type === 'dofollow').length,
    nofollow: backlinks.filter(b => b.link_type === 'nofollow').length,
    avgDR: backlinks.length > 0
      ? Math.round(backlinks.reduce((sum, b) => sum + (b.dr || 0), 0) / backlinks.length)
      : 0,
    highDR: backlinks.filter(b => (b.dr || 0) >= 70).length,
    available: backlinks.filter(b => b.is_available).length
  }

  return {
    backlinks,
    loading,
    error,
    sortBy,
    sortOrder,
    stats,
    createBacklink,
    updateBacklink,
    deleteBacklink,
    setSortBy,
    setSortOrder,
    reload: () => projectId && loadBacklinks(projectId)
  }
}
