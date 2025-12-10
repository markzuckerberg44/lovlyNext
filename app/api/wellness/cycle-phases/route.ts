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

    const { phase_type, start_date } = await request.json();

    if (!phase_type || !start_date) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    const profile = await prisma.profiles.findUnique({
      where: { id: user.id },
      select: { id: true }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
    }

    const coupleMember = await prisma.couple_members.findFirst({
      where: { user_id: user.id },
      select: { couple_id: true }
    });

    if (!coupleMember) {
      return NextResponse.json({ error: 'No pertenece a ninguna pareja' }, { status: 404 });
    }

    const data = await prisma.cycle_phases.create({
      data: {
        user_id: user.id,
        couple_id: coupleMember.couple_id,
        phase_type,
        start_date: new Date(start_date),
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

    const phases = await prisma.cycle_phases.findMany({
      where: { couple_id: coupleMember.couple_id },
      orderBy: { start_date: 'desc' }
    });

    // Convertir fechas a ISO string para evitar problemas de serialización
    const data = phases.map(phase => ({
      ...phase,
      start_date: phase.start_date.toISOString().split('T')[0],
      end_date: phase.end_date ? phase.end_date.toISOString().split('T')[0] : null,
      created_at: phase.created_at.toISOString()
    }));

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { id, end_date } = await request.json();

    if (!id || !end_date) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    const data = await prisma.cycle_phases.update({
      where: { 
        id,
        user_id: user.id 
      },
      data: { end_date: new Date(end_date) }
    });

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Falta el ID del periodo' }, { status: 400 });
    }

    const cyclePhase = await prisma.cycle_phases.findUnique({
      where: { id },
      select: { user_id: true }
    });

    if (!cyclePhase) {
      return NextResponse.json({ error: 'Periodo no encontrado' }, { status: 404 });
    }

    if (cyclePhase.user_id !== user.id) {
      return NextResponse.json({ error: 'No tienes permiso para eliminar este periodo' }, { status: 403 });
    }

    await prisma.cycle_phases.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Periodo eliminado correctamente' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
