'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ChartDataPoint {
  date: string
  position: number
}

interface KeywordHistoryChartProps {
  keywordId: string
}

// ✅ ИМЕНОВАННЫЙ ЭКСПОРТ вместо default
export function KeywordHistoryChart({ keywordId }: KeywordHistoryChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('🔍 Chart mounted, keywordId:', keywordId)
    
    const fetchHistory = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/rank-tracker/history/${keywordId}?days=30`)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        
        const result = await response.json()
        console.log('📊 API Response:', result)
        
        if (result.data && Array.isArray(result.data) && result.data.length > 0) {
          const chartData: ChartDataPoint[] = result.data
            .filter((item: any) => item.position !== null)
            .map((item: any) => ({
              date: new Date(item.checked_at).toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit'
              }),
              position: item.position
            }))
            .reverse()
          
          console.log('✅ Chart data:', chartData.length, 'points')
          setData(chartData)
        } else {
          setData([])
        }
      } catch (err: any) {
        console.error('❌ Error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (keywordId) {
      fetchHistory()
    }
  }, [keywordId])

  if (loading) {
    return <div className="h-64 flex items-center justify-center text-gray-500">Loading...</div>
  }

  if (error) {
    return <div className="h-64 flex items-center justify-center text-red-500">Error: {error}</div>
  }

  if (data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500">Нет данных</div>
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
          <YAxis reversed stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} domain={[1, 100]} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              color: '#fff'
            }}
          />
          <Line type="monotone" dataKey="position" stroke="#F97316" strokeWidth={2} dot={{ fill: '#F97316', r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
