// components/filters/SortSelector.tsx
'use client'

import React from 'react'

interface SortOption {
  value: string
  label: string
}

interface SortSelectorProps {
  options: SortOption[]
  value: string
  order: 'asc' | 'desc'
  onChange: (value: string) => void
  onOrderChange: (order: 'asc' | 'desc') => void
}

export function SortSelector({ 
  options, 
  value, 
  order, 
  onChange, 
  onOrderChange 
}: SortSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff6b00]"
      >
        <option value="">Sort by...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <button
        onClick={() => onOrderChange(order === 'asc' ? 'desc' : 'asc')}
        className="p-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-colors"
        title={order === 'asc' ? 'Sort ascending' : 'Sort descending'}
      >
        {order === 'asc' ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
          </svg>
        )}
      </button>
    </div>
  )
}
