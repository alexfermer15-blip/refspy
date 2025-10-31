import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { competitor_id, competitor_url } = await request.json()

    if (!competitor_id || !competitor_url) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    // 🔥 Здесь вызываешь парсер для получения backlinks
    // Пример моковых данных:
    const mockBacklinks = [
      {
        source_url: 'https://wikipedia.org/wiki/Laminate',
        source_domain: 'wikipedia.org',
        target_url: competitor_url,
        anchor_text: 'best laminate flooring',
        link_type: 'dofollow',
        dr: 95,
        da: 93
      },
      {
        source_url: 'https://reddit.com/r/homeimprovement/12345',
        source_domain: 'reddit.com',
        target_url: competitor_url,
        anchor_text: 'laminate reviews',
        link_type: 'dofollow',
        dr: 91,
        da: 89
      },
      // ... еще backlinks
    ]

    // Сохраняем в БД
    const { data, error } = await supabase
      .from('backlinks')
      .insert(
        mockBacklinks.map(link => ({
          competitor_id,
          ...link
        }))
      )
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      backlinks: data,
      count: data.length
    })
  } catch (error: any) {
    console.error('Backlinks parsing error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
