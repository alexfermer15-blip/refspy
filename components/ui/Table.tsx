'use client'

// components/ui/Table.tsx
import React from 'react'

interface TableProps {
  children: React.ReactNode
  className?: string
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={`w-full ${className}`}>
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ children, className = '' }: TableProps) {
  return (
    <thead className={`bg-gray-800 ${className}`}>
      {children}
    </thead>
  )
}

export function TableBody({ children, className = '' }: TableProps) {
  return (
    <tbody className={className}>
      {children}
    </tbody>
  )
}

export function TableRow({ children, className = '', ...props }: TableProps & React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr 
      className={`border-t border-gray-800 hover:bg-gray-800/50 transition-colors ${className}`}
      {...props}
    >
      {children}
    </tr>
  )
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode
  header?: boolean
}

export function TableCell({ children, header = false, className = '', ...props }: TableCellProps) {
  const Component = header ? 'th' : 'td'
  return (
    <Component 
      className={`px-4 py-3 text-left ${header ? 'font-semibold text-white' : 'text-gray-300'} ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}

