import { createClient } from '@/app/lib/supabase/server';
import { prisma } from '@/app/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { event_date, method, notes } = await request.json();

    if (!event_date || !method) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    const coupleMember = await prisma.couple_members.findFirst({
      where: { user_id: user.id },
      select: { couple_id: true }
    });

    if (!coupleMember) {
      return NextResponse.json({ error: 'No pertenece a ninguna pareja' }, { status: 404 });
    }

    const data = await prisma.contraceptive_events.create({
      data: {
        user_id: user.id,
        couple_id: coupleMember.couple_id,
        event_date: new Date(event_date),
        method,
        notes,
      }
    });

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

    const coupleMember = await prisma.couple_members.findFirst({
      where: { user_id: user.id },
      select: { couple_id: true }
    });

    if (!coupleMember) {
      return NextResponse.json({ error: 'No pertenece a ninguna pareja' }, { status: 404 });
    }

    const events = await prisma.contraceptive_events.findMany({
      where: { couple_id: coupleMember.couple_id },
      orderBy: { event_date: 'desc' }
    });

    // Convertir fechas a ISO string
    const data = events.map(event => ({
      ...event,
      event_date: event.event_date.toISOString().split('T')[0],
      created_at: event.created_at.toISOString()
    }));

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
