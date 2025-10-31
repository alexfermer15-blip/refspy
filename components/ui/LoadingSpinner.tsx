'use client'

// components/ui/LoadingSpinner.tsx
import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'white' | 'gray'
  text?: string
  fullScreen?: boolean
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'primary',
  text,
  fullScreen = false
}: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const colors = {
    primary: 'border-[#ff6b00]',
    white: 'border-white',
    gray: 'border-gray-400'
  }

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`animate-spin rounded-full border-b-2 ${sizes[size]} ${colors[color]}`} />
      {text && (
        <p className="text-gray-400 text-sm">{text}</p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        {spinner}
      </div>
    )
  }

  return spinner
}

