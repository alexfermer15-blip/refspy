import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const keywordId = searchParams.get('keywordId')

  if (!keywordId) {
    return NextResponse.json(
      { error: 'keywordId is required' }, 
      { status: 400 }
    )
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('keyword_history')
      .select('position, checked_at')
      .eq('keyword_id', keywordId)
      .order('checked_at', { ascending: true })
      .limit(30)

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    )
  }
}
