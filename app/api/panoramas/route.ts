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

    const { title, description, target_date, target_time } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'El título es requerido' }, { status: 400 });
    }

    const coupleMember = await prisma.couple_members.findFirst({
      where: { user_id: user.id },
      select: { couple_id: true }
    });

    if (!coupleMember) {
      return NextResponse.json({ error: 'No pertenece a ninguna pareja' }, { status: 404 });
    }

    const data = await prisma.todo_items.create({
      data: {
        couple_id: coupleMember.couple_id,
        created_by_user_id: user.id,
        title,
        description,
        target_date: target_date ? new Date(target_date) : null,
        target_time: target_time || null,
        status: 'todo',
        completed: false,
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

    const data = await prisma.todo_items.findMany({
      where: { couple_id: coupleMember.couple_id },
      orderBy: { created_at: 'desc' }
    });

    const formattedData = data.map(item => ({
      ...item,
      target_date: item.target_date ? item.target_date.toISOString().split('T')[0] : null
    }));

    return NextResponse.json({ data: formattedData }, { status: 200 });
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

    const { id, status, completed } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (completed !== undefined) updateData.completed = completed;

    const data = await prisma.todo_items.update({
      where: { id },
      data: updateData
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
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    await prisma.todo_items.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Panorama eliminado' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
