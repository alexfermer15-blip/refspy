// components/filters/FilterPanel.tsx
'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui'

interface FilterOption {
  label: string
  value: string | number
}

interface FilterGroup {
  key: string
  label: string
  type: 'select' | 'multiselect' | 'range' | 'date'
  options?: FilterOption[]
  min?: number
  max?: number
}

interface FilterPanelProps {
  groups: FilterGroup[]
  activeFilters: Record<string, any>
  onFilterChange: (key: string, value: any) => void
  onReset: () => void
}

export function FilterPanel({ 
  groups, 
  activeFilters, 
  onFilterChange, 
  onReset 
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const activeCount = Object.keys(activeFilters).length

  return (
    <div className="relative">
      {/* Toggle Button */}
      <Button
        variant="secondary"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filters
        {activeCount > 0 && (
          <span className="ml-2 px-2 py-0.5 text-xs bg-[#ff6b00] text-white rounded-full">
            {activeCount}
          </span>
        )}
      </Button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-lg shadow-2xl z-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Filters</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {groups.map((group) => (
              <div key={group.key}>
                <label className="block text-sm font-medium mb-2">
                  {group.label}
                </label>

                {group.type === 'select' && (
                  <select
                    value={activeFilters[group.key] || ''}
                    onChange={(e) => onFilterChange(group.key, e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff6b00]"
                  >
                    <option value="">All</option>
                    {group.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}

                {group.type === 'range' && (
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={group.min}
                      max={group.max}
                      value={activeFilters[group.key] || group.min}
                      onChange={(e) => onFilterChange(group.key, parseInt(e.target.value))}
                      className="w-full accent-[#ff6b00]"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{group.min}</span>
                      <span>{activeFilters[group.key] || group.min}</span>
                      <span>{group.max}</span>
                    </div>
                  </div>
                )}

                {group.type === 'date' && (
                  <input
                    type="date"
                    value={activeFilters[group.key] || ''}
                    onChange={(e) => onFilterChange(group.key, e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff6b00]"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-800 flex gap-2">
            <Button variant="ghost" onClick={onReset} fullWidth>
              Reset
            </Button>
            <Button onClick={() => setIsOpen(false)} fullWidth>
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
