// app/api/check-free-placement/route.ts
import { NextResponse } from 'next/server'
import { checkFreeOpportunities } from '@/lib/marketplaces'

export async function POST(request: Request) {
  try {
    const { domain } = await request.json()

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      )
    }

    console.log('🆓 Checking free placement for:', domain)

    const opportunities = await checkFreeOpportunities(domain)

    console.log(`✅ Found ${opportunities.length} free opportunities`)

    return NextResponse.json({
      success: true,
      opportunities,
      count: opportunities.length
    })

  } catch (error: any) {
    console.error('❌ Free placement check error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check free placement' },
      { status: 500 }
    )
  }
}
