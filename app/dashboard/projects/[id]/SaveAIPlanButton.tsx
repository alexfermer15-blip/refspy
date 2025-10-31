'use client'

import { useState } from 'react'
import { Save, Check, AlertCircle } from 'lucide-react'

interface SaveAIPlanButtonProps {
  projectId: string
  recommendations: any
  budget: number
}

export default function SaveAIPlanButton({ projectId, recommendations, budget }: SaveAIPlanButtonProps) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')

      const response = await fetch('/api/ai-plans/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          project_id: projectId,
          summary: recommendations.summary,
          budget_breakdown: recommendations.budget_breakdown,
          timeline: recommendations.timeline,
          expected_results: recommendations.expected_results,
          budget,
          provider: recommendations.provider || 'OpenRouter'
        })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to save plan')
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)

    } catch (err: any) {
      console.error('Save error:', err)
      setError(err.message || 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleSave}
        disabled={saving || saved}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
          ${saved 
            ? 'bg-green-500/20 text-green-400 cursor-default' 
            : 'bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50'
          }
        `}
      >
        {saving ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Сохранение...</span>
          </>
        ) : saved ? (
          <>
            <Check className="w-4 h-4" />
            <span>Сохранено!</span>
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            <span>Сохранить план</span>
          </>
        )}
      </button>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
