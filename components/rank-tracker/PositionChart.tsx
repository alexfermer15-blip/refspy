'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface PositionData {
  date: string
  position: number | null
}

interface PositionChartProps {
  data: PositionData[]
  keyword: string
}

export default function PositionChart({ data, keyword }: PositionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-900/50 border border-gray-800 rounded-xl">
        <p className="text-gray-400">Нет данных для отображения графика</p>
      </div>
    )
  }

  // Форматируем данные для графика
  const chartData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit' 
    }),
    position: item.position,
  }))

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">
        История позиций: {keyword}
      </h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            reversed
            domain={[1, 100]}
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            label={{ value: 'Позиция', angle: -90, position: 'insideLeft', style: { fill: '#9CA3AF' } }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '8px'
            }}
            labelStyle={{ color: '#F3F4F6' }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="position" 
            stroke="#F97316" 
            strokeWidth={2}
            dot={{ fill: '#F97316', r: 4 }}
            activeDot={{ r: 6 }}
            name="Позиция"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
