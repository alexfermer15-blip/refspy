import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      projects: projects || []
    })
    
  } catch (error: any) {
    console.error('❌ Error fetching projects:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, domain, description } = body
    
    if (!name || !domain) {
      return NextResponse.json(
        { success: false, error: 'Name and domain required' },
        { status: 400 }
      )
    }
    
    const { data, error } = await supabase
      .from('projects')
      .insert({
        name,
        domain,
        description: description || null
      })
      .select()
      .single()
    
    if (error) throw error
    
    console.log(`✅ Project created: ${name}`)
    
    return NextResponse.json({
      success: true,
      project: data
    })
    
  } catch (error: any) {
    console.error('❌ Error creating project:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const project_id = searchParams.get('id')
    
    if (!project_id) {
      return NextResponse.json(
        { success: false, error: 'Project ID required' },
        { status: 400 }
      )
    }
    
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', project_id)
    
    if (error) throw error
    
    console.log(`✅ Project deleted: ${project_id}`)
    
    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    })
    
  } catch (error: any) {
    console.error('❌ Error deleting project:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
