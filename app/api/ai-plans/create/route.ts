// app/api/ai-plans/create/route.ts

import { NextRequest, NextResponse } from 'next/server'

interface GapOpportunity {
  source_domain: string
  competitor_count: number
  avg_dr: number
  total_links: number
  competitors: string[]
}

interface MarketplaceOffer {
  domain: string
  marketplace: string
  price: number
  currency: string
  dr: number
  link_type: string
}

interface TimelineItem {
  month: number
  action: string
  expected_links: number
}

interface BudgetItem {
  domain: string
  type: string
  priority: string
  cost: number
}

interface AIPlan {
  summary: string
  budget_breakdown: BudgetItem[]
  timeline: TimelineItem[]
  expected_results: {
    position_improvement: string
    estimated_traffic: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { project_id, opportunities, marketplace_offers, budget, keyword } = body

    if (!project_id || !opportunities || opportunities.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('🤖 Creating AI Plan for project:', project_id)
    console.log('💰 Budget:', budget, 'RUB')
    console.log('📊 Opportunities:', opportunities.length)

    // Сортируем возможности по приоритету
    const sortedOpportunities = [...opportunities].sort((a: GapOpportunity, b: GapOpportunity) => {
      if (b.competitor_count !== a.competitor_count) {
        return b.competitor_count - a.competitor_count
      }
      return b.avg_dr - a.avg_dr
    })

    // Фильтруем предложения по бюджету
    let remainingBudget = budget || 50000
    const selectedOffers: MarketplaceOffer[] = []
    const budgetBreakdown: BudgetItem[] = []

    marketplace_offers?.forEach((offer: MarketplaceOffer) => {
      if (offer.price <= remainingBudget && selectedOffers.length < 10) {
        selectedOffers.push(offer)
        remainingBudget -= offer.price

        budgetBreakdown.push({
          domain: offer.domain,
          type: `${offer.link_type} ссылка`,
          priority: offer.dr >= 70 ? 'Высокий' : offer.dr >= 40 ? 'Средний' : 'Низкий',
          cost: offer.price
        })
      }
    })

    // Создаём временной план (timeline)
    const timeline: TimelineItem[] = []
    const linksPerMonth = Math.ceil(selectedOffers.length / 6) // Распределяем на 6 месяцев

    for (let month = 1; month <= 6; month++) {
      const startIdx = (month - 1) * linksPerMonth
      const endIdx = Math.min(month * linksPerMonth, selectedOffers.length)
      const monthOffers = selectedOffers.slice(startIdx, endIdx)

      if (monthOffers.length > 0) {
        timeline.push({
          month,
          action: `Получить ${monthOffers.length} ${monthOffers.length === 1 ? 'ссылку' : 'ссылки'} с сайтов: ${monthOffers.map(o => o.domain).slice(0, 3).join(', ')}${monthOffers.length > 3 ? ' и др.' : ''}`,
          expected_links: monthOffers.length
        })
      }
    }

    // Прогноз результатов
    const totalDR = selectedOffers.reduce((sum, offer) => sum + offer.dr, 0)
    const avgDR = totalDR / selectedOffers.length || 0
    const estimatedPositionImprovement = Math.min(Math.floor(avgDR / 10), 20)
    const estimatedTraffic = Math.floor(selectedOffers.length * avgDR * 5)

    const aiPlan: AIPlan = {
      summary: `План построения ссылочной массы для ключевого слова "${keyword}". ` +
        `Рекомендуется получить ${selectedOffers.length} качественных ссылок ` +
        `со средним DR ${Math.round(avgDR)} в течение 6 месяцев. ` +
        `Общий бюджет: ${budget?.toLocaleString() || '50,000'} ₽. ` +
        `Ожидаемое улучшение позиций: ${estimatedPositionImprovement}+ мест.`,
      budget_breakdown: budgetBreakdown,
      timeline,
      expected_results: {
        position_improvement: `↑ ${estimatedPositionImprovement}+ позиций`,
        estimated_traffic: `+${estimatedTraffic.toLocaleString()} визитов/мес`
      }
    }

    console.log('✅ AI Plan created successfully!')
    console.log('📊 Selected offers:', selectedOffers.length)
    console.log('💰 Total cost:', budget - remainingBudget, 'RUB')

    return NextResponse.json({
      success: true,
      plan: aiPlan
    })

  } catch (error: any) {
    console.error('❌ AI Plan creation error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
