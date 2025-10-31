// app/api/dashboard/route.ts
import { NextResponse } from 'next/server'
import type { ApiResponse } from '@/lib/types'

interface DashboardStats {
  activeOperations: number
  intelGathered: number
  targetsTracked: number
  aiScansLeft: number
  aiScansTotal: number
}

interface DashboardData {
  stats: DashboardStats
  recentActivity: Array<{
    time: string
    message: string
  }>
}

export async function GET(request: Request): Promise<NextResponse<ApiResponse<DashboardData>>> {
  console.log('📊 Dashboard API called')

  try {
    // Временные данные для тестирования
    const dashboardData: DashboardData = {
      stats: {
        activeOperations: 12,
        intelGathered: 2847,
        targetsTracked: 18,
        aiScansLeft: 478,
        aiScansTotal: 500
      },
      recentActivity: [
        { time: '14:35:12', message: 'System initialized' },
        { time: '14:35:45', message: 'Database connection established' }
      ]
    }

    return NextResponse.json<ApiResponse<DashboardData>>({
      success: true,
      data: dashboardData
    }, { status: 200 })
  } catch (error: any) {
    console.error('Dashboard API error:', error.message)
    return NextResponse.json<ApiResponse<DashboardData>>({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
