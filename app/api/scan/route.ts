import { NextResponse } from 'next/server'

// Временное хранилище сканирований (в памяти)
const scans: any[] = []

export async function POST(request: Request) {
  console.log('🔍 Scan API called')
  
  try {
    const body = await request.json()
    const { domain } = body

    console.log('Scanning domain:', domain)

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
    }

    // Очистка домена от протокола
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '')

    // Генерируем fake данные для демонстрации
    // В production здесь будет реальный API call к Ahrefs/SEMrush
    const scanResult = {
      id: crypto.randomUUID(),
      domain: cleanDomain,
      status: 'completed',
      scannedAt: new Date().toISOString(),
      stats: {
        totalBacklinks: Math.floor(Math.random() * 10000) + 1000,
        referringDomains: Math.floor(Math.random() * 500) + 100,
        domainRating: Math.floor(Math.random() * 100),
        organicTraffic: Math.floor(Math.random() * 100000) + 5000
      },
      topBacklinks: [
        {
          url: `https://example1.com/blog/${cleanDomain}`,
          domainRating: Math.floor(Math.random() * 30) + 70,
          traffic: Math.floor(Math.random() * 10000) + 10000,
          linkType: 'dofollow'
        },
        {
          url: `https://example2.com/resources/${cleanDomain}`,
          domainRating: Math.floor(Math.random() * 20) + 60,
          traffic: Math.floor(Math.random() * 8000) + 8000,
          linkType: 'dofollow'
        },
        {
          url: `https://example3.com/links/${cleanDomain}`,
          domainRating: Math.floor(Math.random() * 20) + 50,
          traffic: Math.floor(Math.random() * 5000) + 5000,
          linkType: 'nofollow'
        },
        {
          url: `https://example4.com/directory/${cleanDomain}`,
          domainRating: Math.floor(Math.random() * 15) + 45,
          traffic: Math.floor(Math.random() * 3000) + 3000,
          linkType: 'dofollow'
        },
        {
          url: `https://example5.com/partners/${cleanDomain}`,
          domainRating: Math.floor(Math.random() * 15) + 40,
          traffic: Math.floor(Math.random() * 2000) + 2000,
          linkType: 'nofollow'
        }
      ]
    }

    // Сохраняем скан
    scans.push(scanResult)

    console.log('✅ Scan completed:', scanResult.id)
    console.log('Total scans:', scans.length)

    return NextResponse.json({ 
      success: true, 
      scan: scanResult 
    }, { status: 200 })

  } catch (error: any) {
    console.error('Scan error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// GET для получения истории сканирований
export async function GET(request: Request) {
  console.log('📊 Getting scan history')
  console.log('Total scans:', scans.length)
  
  return NextResponse.json({ 
    success: true,
    scans,
    total: scans.length
  }, { status: 200 })
}
