'use client'

// components/ui/Badge.tsx
import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Badge({ 
  children, 
  variant = 'default', 
  size = 'md',
  className = '' 
}: BadgeProps) {
  const variants = {
    success: 'bg-green-500/20 text-green-500 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    danger: 'bg-red-500/20 text-red-500 border-red-500/30',
    info: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    default: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  }

  return (
    <span className={`inline-flex items-center font-semibold rounded border ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  )
}

// Специальный Status Badge для проектов
interface StatusBadgeProps {
  status: 'draft' | 'analyzing' | 'active' | 'completed' | 'paused'
  size?: 'sm' | 'md' | 'lg'
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const statusConfig = {
    draft: { variant: 'default' as const, label: 'Draft' },
    analyzing: { variant: 'warning' as const, label: 'Analyzing' },
    active: { variant: 'success' as const, label: 'Active' },
    completed: { variant: 'info' as const, label: 'Completed' },
    paused: { variant: 'danger' as const, label: 'Paused' }
  }

  const config = statusConfig[status]

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  )
}

