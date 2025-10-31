// lib/hooks/useProjects.ts
'use client'

import { useState, useEffect } from 'react'
import { projectsAPI } from '@/lib/supabase'
import type { Project, CreateProjectData, ProjectStats } from '@/lib/types'

export function useProjects(userId?: string) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userId) {
      loadProjects(userId)
    }
  }, [userId])

  const loadProjects = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await projectsAPI.getByUser(id)
      setProjects(data)
    } catch (err: any) {
      console.error('Error loading projects:', err)
      setError(err.message || 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (projectData: CreateProjectData): Promise<Project | null> => {
    setError(null)
    try {
      console.log('🚀 Creating project with data:', projectData) // ✅ ЛОГ
      
      const dataToCreate: Omit<Project, 'id' | 'created_at' | 'updated_at'> = {
        user_id: projectData.user_id,
        name: projectData.name,
        keyword: projectData.keyword,
        domain: projectData.domain,
        region: projectData.region,
        depth: projectData.depth,
        status: projectData.status
      }
      
      console.log('📦 Data to create:', dataToCreate) // ✅ ЛОГ
      
      const newProject = await projectsAPI.create(dataToCreate)
      
      console.log('✅ Project created successfully:', newProject) // ✅ ЛОГ
      
      if (newProject) {
        setProjects(prev => [newProject, ...prev])
        return newProject
      }
      
      console.warn('⚠️ Project creation returned null') // ✅ ЛОГ
      return null
    } catch (err: any) {
      console.error('❌ Error creating project:', err) // ✅ ЛОГ
      console.error('❌ Error details:', {
        message: err.message,
        code: err.code,
        details: err.details,
        hint: err.hint,
        full: err
      }) // ✅ ПОЛНЫЙ ЛОГ
      
      setError(err.message || err.error_description || 'Failed to create project')
      return null
    }
  }

  const updateProject = async (id: string, updates: Partial<Project>): Promise<Project | null> => {
    setError(null)
    try {
      const updated = await projectsAPI.update(id, updates)
      if (updated) {
        setProjects(prev => prev.map(p => p.id === id ? updated : p))
      }
      return updated
    } catch (err: any) {
      console.error('Error updating project:', err)
      setError(err.message || 'Failed to update project')
      return null
    }
  }

  const deleteProject = async (id: string): Promise<boolean> => {
    setError(null)
    try {
      await projectsAPI.delete(id)
      setProjects(prev => prev.filter(p => p.id !== id))
      return true
    } catch (err: any) {
      console.error('Error deleting project:', err)
      setError(err.message || 'Failed to delete project')
      return false
    }
  }

  const stats: ProjectStats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    analyzing: projects.filter(p => p.status === 'analyzing').length,
    completed: projects.filter(p => p.status === 'completed').length,
    paused: projects.filter(p => p.status === 'paused').length
  }

  return {
    projects,
    loading,
    error,
    stats,
    createProject,
    updateProject,
    deleteProject,
    reload: () => userId && loadProjects(userId)
  }
}
