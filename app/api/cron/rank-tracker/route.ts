// app/api/cron/rank-tracker/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { checkPosition } from '@/lib/google-search'

export async function GET(request: NextRequest) {
  try {
    // Проверка секретного токена для безопасности
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient()

    // Получаем все активные проекты с доменами
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, keyword, domain, region')
      .eq('status', 'analyzing')
      .not('domain', 'is', null)

    if (error) throw error

    const results = []

    // Проверяем позиции для каждого проекта
    for (const project of projects || []) {
      try {
        const position = await checkPosition(
          project.keyword,
          project.domain,
          project.region || 'us'
        )

        // Сохраняем в историю
        await supabase
          .from('rank_tracking')
          .insert({
            project_id: project.id,
            keyword: project.keyword,
            domain: project.domain,
            position: position,
            search_engine: 'google',
            region: project.region || 'us',
            checked_at: new Date().toISOString()
          })

        results.push({
          project_id: project.id,
          keyword: project.keyword,
          position: position
        })

        console.log(`✅ Checked position for ${project.domain}: ${position || 'Not in TOP-100'}`)

      } catch (error) {
        console.error(`❌ Error checking ${project.domain}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      checked: results.length,
      results
    })

  } catch (error: any) {
    console.error('Cron error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
