// app/api/gap-analysis/analyze/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface Backlink {
  id: string
  source_domain: string
  source_url: string
  target_url: string
  anchor_text: string
  dr: number
  link_type: string
  competitor_id: string
}

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { project_id, backlink_ids } = body

    if (!project_id || !backlink_ids || backlink_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('🔍 Running Gap Analysis for project:', project_id)
    console.log('📊 Analyzing', backlink_ids.length, 'backlinks')

    // Получаем выбранные бэклинки из базы данных
    const { data: backlinks, error: backlinksError } = await supabase
      .from('backlinks')
      .select('*')
      .in('id', backlink_ids)

    if (backlinksError) {
      console.error('❌ Error fetching backlinks:', backlinksError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch backlinks' },
        { status: 500 }
      )
    }

    if (!backlinks || backlinks.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No backlinks found' },
        { status: 404 }
      )
    }

    console.log('✅ Found', backlinks.length, 'backlinks in database')

    // Группируем бэклинки по доменам
    const domainMap = new Map<string, Backlink[]>()
    
    backlinks.forEach((backlink: Backlink) => {
      const domain = backlink.source_domain
      if (!domainMap.has(domain)) {
        domainMap.set(domain, [])
      }
      domainMap.get(domain)!.push(backlink)
    })

    console.log('📊 Grouped into', domainMap.size, 'unique domains')

    // Создаём Gap Opportunities (возможности для получения ссылок)
    const opportunities: GapOpportunity[] = []

    domainMap.forEach((links, domain) => {
      // Подсчитываем уникальных конкурентов для этого домена
      const competitorIds = new Set(links.map(l => l.competitor_id))
      
      // Вычисляем средний DR
      const totalDr = links.reduce((sum, l) => sum + l.dr, 0)
      const avgDr = Math.round(totalDr / links.length)

      opportunities.push({
        source_domain: domain,
        competitor_count: competitorIds.size,
        avg_dr: avgDr,
        total_links: links.length,
        competitors: Array.from(competitorIds)
      })
    })

    // Сортируем по приоритету:
    // 1. Больше конкурентов = выше приоритет
    // 2. Выше DR = выше приоритет
    opportunities.sort((a, b) => {
      if (b.competitor_count !== a.competitor_count) {
        return b.competitor_count - a.competitor_count
      }
      return b.avg_dr - a.avg_dr
    })

    console.log('🎯 Found', opportunities.length, 'gap opportunities')

    // Генерируем предложения с маркетплейсов
    // (В реальном приложении здесь будет API запрос к маркетплейсам)
    const marketplaceOffers: MarketplaceOffer[] = opportunities
      .slice(0, 10) // Берём топ-10 возможностей
      .flatMap(opp => {
        // Базовая цена зависит от DR
        const basePrice = Math.max(5000, opp.avg_dr * 100 + Math.random() * 5000)
        
        return [
          {
            domain: opp.source_domain,
            marketplace: 'Sape.ru',
            price: Math.round(basePrice * 0.8),
            currency: 'RUB',
            dr: opp.avg_dr,
            link_type: 'dofollow'
          },
          {
            domain: opp.source_domain,
            marketplace: 'GoGetLinks',
            price: Math.round(basePrice),
            currency: 'RUB',
            dr: opp.avg_dr,
            link_type: 'dofollow'
          },
          {
            domain: opp.source_domain,
            marketplace: 'Miralinks',
            price: Math.round(basePrice * 1.2),
            currency: 'RUB',
            dr: opp.avg_dr,
            link_type: 'dofollow'
          }
        ]
      })

    console.log('✅ Gap Analysis complete!')
    console.log('📊 Found', opportunities.length, 'opportunities')
    console.log('💰 Generated', marketplaceOffers.length, 'marketplace offers')

    return NextResponse.json({
      success: true,
      opportunities,
      marketplace_offers: marketplaceOffers
    })

  } catch (error: any) {
    console.error('❌ Gap Analysis error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
