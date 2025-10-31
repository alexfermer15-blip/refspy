// app/api/rank-tracker/keywords/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    let query = supabase
      .from('keywords')
      .select(`
        *,
        rank_history(
          position,
          previous_position,
          position_change,
          checked_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('DB Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const keywordsWithLatest = data?.map(keyword => ({
      ...keyword,
      latest_position: keyword.rank_history?.[0] || null
    }));

    return NextResponse.json(keywordsWithLatest || []);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    const {
      keyword,
      target_url,
      project_id,
      search_engine = 'google',
      location = 'global',
      language = 'en',
      device = 'desktop',
      check_frequency = 'daily'
    } = body;

    if (!keyword || !target_url) {
      return NextResponse.json(
        { error: 'Keyword and target_url required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('keywords')
      .insert({
        user_id: userId,
        keyword,
        target_url,
        project_id,
        search_engine,
        location,
        language,
        device,
        check_frequency,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Insert Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('POST Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal error' },
      { status: 500 }
    );
  }
}
