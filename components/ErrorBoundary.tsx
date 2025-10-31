// components/ErrorBoundary.tsx
'use client'

import React, { Component, ReactNode } from 'react'
import { Button } from '@/components/ui'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Отправка в систему мониторинга ошибок (Sentry, LogRocket и т.д.)
    if (process.env.NODE_ENV === 'production') {
      // TODO: Интеграция с Sentry
      // Sentry.captureException(error, { contexts: { react: errorInfo } })
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="text-6xl mb-6">💥</div>
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#ff6b00] to-red-600 bg-clip-text text-transparent">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-400 mb-6">
              We're sorry for the inconvenience. The error has been logged and we'll fix it soon.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-gray-900 border border-red-500 rounded-lg p-4 mb-6 text-left overflow-auto">
                <p className="text-red-500 font-mono text-sm mb-2">
                  {this.state.error.name}: {this.state.error.message}
                </p>
                <pre className="text-xs text-gray-500 overflow-x-auto">
                  {this.state.error.stack}
                </pre>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <Button onClick={this.handleReset} variant="primary">
                Try Again
              </Button>
              <Button onClick={() => window.location.href = '/'} variant="secondary">
                Go Home
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook-based альтернатива для функциональных компонентов
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return setError
}
