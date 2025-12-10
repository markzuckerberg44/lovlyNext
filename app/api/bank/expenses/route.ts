import { createClient } from '@/app/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { amount, description, expense_date } = await request.json();

    if (!amount || !description) {
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
      .from('piggy_bank_expenses')
      .insert({
        couple_id: coupleMember.couple_id,
        user_id: user.id,
        amount,
        description,
        expense_date: expense_date || new Date().toISOString().split('T')[0],
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
      .from('piggy_bank_expenses')
      .select('*')
      .eq('couple_id', coupleMember.couple_id)
      .order('expense_date', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
