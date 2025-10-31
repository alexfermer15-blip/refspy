// app/api/marketplace-prices/route.ts
import { NextResponse } from 'next/server'
import { searchMarketplacesFree } from '@/lib/marketplaces-scraper'

export async function POST(request: Request) {
  try {
    const { domains } = await request.json()

    if (!domains || !Array.isArray(domains) || domains.length === 0) {
      return NextResponse.json(
        { error: 'Domains array is required' },
        { status: 400 }
      )
    }

    console.log('🆓 Free search for:', domains)

    // Используем БЕСПЛАТНЫЙ метод
    const offers = await searchMarketplacesFree(domains)

    console.log(`✅ Found ${offers.length} offers`)

    return NextResponse.json({
      success: true,
      offers,
      count: offers.length,
      note: 'Prices are estimated based on domain metrics and market averages'
    })

  } catch (error: any) {
    console.error('❌ Marketplace search error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to search marketplace prices' },
      { status: 500 }
    )
  }
}
