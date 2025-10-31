// app/api/analyze-backlinks/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { backlinksAPI } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { projectId, competitorIds } = await request.json()

    console.log('🔗 Analyzing backlinks for:', { projectId, competitorIds })

    if (!projectId || !competitorIds || competitorIds.length === 0) {
      return NextResponse.json(
        { error: 'Project ID and competitor IDs are required' },
        { status: 400 }
      )
    }

    // ========================================
    // MOCK ДАННЫЕ для бэклинков
    // ========================================
    const allBacklinks = []

    for (const competitorId of competitorIds) {
      const mockBacklinks = generateMockBacklinks(projectId, competitorId)
      allBacklinks.push(...mockBacklinks)
    }

    console.log('📊 Generated mock backlinks:', allBacklinks.length)

    // Сохраняем бэклинки в базу данных
    const savedBacklinks = await backlinksAPI.createBulk(allBacklinks)

    console.log('✅ Saved backlinks to database:', savedBacklinks?.length)

    return NextResponse.json({
      success: true,
      backlinks: savedBacklinks,
      count: savedBacklinks?.length || 0
    })

  } catch (error: any) {
    console.error('❌ Error analyzing backlinks:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze backlinks' },
      { status: 500 }
    )
  }
}

// ========================================
// MOCK ГЕНЕРАТОР БЭКЛИНКОВ
// ========================================
function generateMockBacklinks(projectId: string, competitorId: string) {
  const sources = [
    { domain: 'techcrunch.com', dr: 93 },
    { domain: 'forbes.com', dr: 95 },
    { domain: 'theverge.com', dr: 91 },
    { domain: 'wired.com', dr: 92 },
    { domain: 'mashable.com', dr: 91 },
    { domain: 'bbc.com', dr: 95 },
    { domain: 'cnn.com', dr: 95 },
    { domain: 'nytimes.com', dr: 95 },
    { domain: 'theguardian.com', dr: 94 },
    { domain: 'huffpost.com', dr: 92 },
    { domain: 'businessinsider.com', dr: 93 },
    { domain: 'entrepreneur.com', dr: 89 },
    { domain: 'inc.com', dr: 91 },
    { domain: 'fastcompany.com', dr: 90 },
    { domain: 'venturebeat.com', dr: 89 }
  ]

  const anchors = [
    'click here',
    'read more',
    'best practices',
    'learn more',
    'get started',
    'see details',
    'expert guide',
    'comprehensive review',
    'top solutions',
    'recommended tools'
  ]

  // Генерируем 20-50 бэклинков для каждого конкурента
  const count = Math.floor(Math.random() * 30) + 20
  
  return Array.from({ length: count }, (_, index) => {
    const source = sources[Math.floor(Math.random() * sources.length)]
    const anchor = anchors[Math.floor(Math.random() * anchors.length)]
    const isDofollow = Math.random() > 0.3 // 70% dofollow

    return {
      project_id: projectId,
      competitor_id: competitorId,
      source_domain: source.domain,
      source_url: `https://${source.domain}/article/${Math.random().toString(36).substring(7)}`,
      target_url: `https://example.com/page/${index}`,
      anchor_text: anchor,
      link_type: isDofollow ? 'dofollow' : 'nofollow',
      dr: source.dr,
      da: source.dr - Math.floor(Math.random() * 5),
      traffic: Math.floor(Math.random() * 100000) + 10000,
      spam_score: Math.floor(Math.random() * 10),
      is_available: Math.random() > 0.2, // 80% доступны
      discovered_at: new Date().toISOString()
    }
  })
}
