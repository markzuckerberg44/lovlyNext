import { createClient } from '@/app/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { event_date, used_condom, notes } = await request.json();

    if (!event_date || used_condom === undefined) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    const { data: coupleMember, error: coupleMemberError } = await supabase
      .from('couple_members')
      .select('couple_id')
      .eq('user_id', user.id)
      .single();

    if (coupleMemberError || !coupleMember) {
      return NextResponse.json({ error: 'No pertenece a ninguna pareja' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('intimacy_events')
      .insert({
        couple_id: coupleMember.couple_id,
        created_by_user_id: user.id,
        event_date,
        used_condom,
        notes,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { data: coupleMember, error: coupleMemberError } = await supabase
      .from('couple_members')
      .select('couple_id')
      .eq('user_id', user.id)
      .single();

    if (coupleMemberError || !coupleMember) {
      return NextResponse.json({ error: 'No pertenece a ninguna pareja' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('intimacy_events')
      .select('*')
      .eq('couple_id', coupleMember.couple_id)
      .order('event_date', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
