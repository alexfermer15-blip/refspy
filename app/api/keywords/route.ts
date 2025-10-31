import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET - Получить все keywords проекта
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const project_id = searchParams.get('project_id')
    
    if (!project_id) {
      return NextResponse.json(
        { success: false, error: 'Project ID required' },
        { status: 400 }
      )
    }
    
    const { data: keywords, error } = await supabase
      .from('keywords')
      .select('*')
      .eq('project_id', project_id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      keywords: keywords || []
    })
    
  } catch (error: any) {
    console.error('❌ Error fetching keywords:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - Добавить новый keyword
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { project_id, keyword, target_url, search_volume, difficulty } = body
    
    if (!project_id || !keyword) {
      return NextResponse.json(
        { success: false, error: 'Project ID and keyword required' },
        { status: 400 }
      )
    }
    
    // Проверяем, не существует ли уже такой keyword
    const { data: existing } = await supabase
      .from('keywords')
      .select('id')
      .eq('project_id', project_id)
      .eq('keyword', keyword)
      .single()
    
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Keyword already exists for this project' },
        { status: 409 }
      )
    }
    
    const { data, error } = await supabase
      .from('keywords')
      .insert({
        project_id,
        keyword,
        target_url: target_url || null,
        search_volume: search_volume || 0,
        difficulty: difficulty || 0
      })
      .select()
      .single()
    
    if (error) throw error
    
    console.log(`✅ Keyword added: "${keyword}"`)
    
    return NextResponse.json({
      success: true,
      keyword: data
    })
    
  } catch (error: any) {
    console.error('❌ Error creating keyword:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Удалить keyword
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const keyword_id = searchParams.get('id')
    
    if (!keyword_id) {
      return NextResponse.json(
        { success: false, error: 'Keyword ID required' },
        { status: 400 }
      )
    }
    
    const { error } = await supabase
      .from('keywords')
      .delete()
      .eq('id', keyword_id)
    
    if (error) throw error
    
    console.log(`✅ Keyword deleted: ${keyword_id}`)
    
    return NextResponse.json({
      success: true,
      message: 'Keyword deleted successfully'
    })
    
  } catch (error: any) {
    console.error('❌ Error deleting keyword:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
