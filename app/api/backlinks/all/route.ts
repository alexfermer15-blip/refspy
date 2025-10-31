// app/api/backlinks/all/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Backlink, ApiResponse } from '@/lib/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Backlink[]>>> {
  try {
    const projectId = request.nextUrl.searchParams.get('project_id')

    if (!projectId) {
      return NextResponse.json<ApiResponse<Backlink[]>>(
        {
          success: false,
          error: 'project_id is required'
        },
        { status: 400 }
      )
    }

    console.log(`📡 Loading all backlinks for project: ${projectId}`)

    // ✅ Прямой запрос к backlinks по project_id
    const { data: backlinks, error: backlinksError } = await supabase
      .from('backlinks')
      .select('*')
      .eq('project_id', projectId)
      .order('dr', { ascending: false })

    if (backlinksError) {
      console.error('❌ Error fetching backlinks:', backlinksError)
      return NextResponse.json<ApiResponse<Backlink[]>>(
        {
          success: false,
          error: backlinksError.message
        },
        { status: 500 }
      )
    }

    // ✅ Извлекаем domain из competitor_url
    const enrichedBacklinks = backlinks.map((link: any) => {
      let domain = ''
      try {
        domain = new URL(link.source_url).hostname.replace('www.', '')
      } catch (e) {
        domain = link.source_domain || ''
      }

      return {
        ...link,
        source_domain: domain
      } as Backlink
    })

    console.log(`✅ Found ${enrichedBacklinks.length} backlinks`)

    return NextResponse.json<ApiResponse<Backlink[]>>({
      success: true,
      data: enrichedBacklinks
    })
  } catch (error: any) {
    console.error('❌ API Error:', error)
    return NextResponse.json<ApiResponse<Backlink[]>>(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    )
  }
}
