// app/api/analyze-competitors/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { competitorsAPI } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { projectId, keyword, region } = await request.json()

    console.log('🔍 Analyzing competitors for:', { projectId, keyword, region })

    if (!projectId || !keyword) {
      return NextResponse.json(
        { error: 'Project ID and keyword are required' },
        { status: 400 }
      )
    }

    // ========================================
    // MOCK ДАННЫЕ (временно, пока нет SERP API)
    // ========================================
    const mockCompetitors = generateMockCompetitors(keyword, region)

    console.log('📊 Generated mock competitors:', mockCompetitors.length)

    // Сохраняем конкурентов в базу данных
    const savedCompetitors = await competitorsAPI.createBulk(projectId, mockCompetitors)

    console.log('✅ Saved competitors to database:', savedCompetitors?.length)

    return NextResponse.json({
      success: true,
      competitors: savedCompetitors,
      count: savedCompetitors?.length || 0
    })

  } catch (error: any) {
    console.error('❌ Error analyzing competitors:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze competitors' },
      { status: 500 }
    )
  }
}

// ========================================
// MOCK ДАННЫЕ ГЕНЕРАТОР
// ========================================
function generateMockCompetitors(keyword: string, region: string) {
  const domains = [
    'wikipedia.org',
    'amazon.com',
    'reddit.com',
    'youtube.com',
    'linkedin.com',
    'facebook.com',
    'twitter.com',
    'medium.com',
    'quora.com',
    'stackoverflow.com'
  ]

  return domains.map((domain, index) => ({
    domain,
    position: index + 1,
    url: `https://${domain}/search?q=${encodeURIComponent(keyword)}`,
    title: `${keyword} - ${domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)}`,
    description: `Find the best ${keyword} on ${domain}. Comprehensive information and resources.`,
    snippet: `Top results for ${keyword} in ${region}. Expert advice and recommendations.`,
    dr: Math.floor(Math.random() * 40) + 60, // 60-100
    da: Math.floor(Math.random() * 40) + 60,
    traffic: Math.floor(Math.random() * 1000000) + 100000,
    backlinks_count: Math.floor(Math.random() * 10000000) + 100000,
    referring_domains: Math.floor(Math.random() * 100000) + 10000,
    organic_traffic: Math.floor(Math.random() * 5000000) + 50000,
    is_selected: false
  }))
}
