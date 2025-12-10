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

    const { invite_code, message } = await request.json();

    if (!invite_code) {
      return NextResponse.json({ error: 'Código de invitación requerido' }, { status: 400 });
    }

    const senderCouple = await prisma.couple_members.findFirst({
      where: { user_id: user.id },
      select: { couple_id: true }
    });

    if (senderCouple) {
      return NextResponse.json({ error: 'Ya estás en una relación' }, { status: 400 });
    }

    const receiver = await prisma.profiles.findFirst({
      where: { invite_code },
      select: { id: true, display_name: true }
    });

    if (!receiver) {
      return NextResponse.json({ error: 'Código de invitación inválido' }, { status: 404 });
    }

    if (receiver.id === user.id) {
      return NextResponse.json({ error: 'No puedes enviarte una invitación a ti mismo' }, { status: 400 });
    }

    const receiverCouple = await prisma.couple_members.findFirst({
      where: { user_id: receiver.id },
      select: { couple_id: true }
    });

    if (receiverCouple) {
      return NextResponse.json({ error: 'Esta persona ya está en una relación' }, { status: 400 });
    }

    const existingInvitation = await prisma.couple_invitations.findFirst({
      where: {
        sender_user_id: user.id,
        receiver_user_id: receiver.id,
        status: 'pending'
      },
      select: { id: true }
    });

    if (existingInvitation) {
      return NextResponse.json({ error: 'Ya existe una invitación pendiente' }, { status: 400 });
    }

    const data = await prisma.couple_invitations.create({
      data: {
        sender_user_id: user.id,
        receiver_user_id: receiver.id,
        message: message || null,
        status: 'pending'
      }
    });

    return NextResponse.json({ data, message: 'Invitación enviada' }, { status: 201 });
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

    const data = await prisma.couple_invitations.findMany({
      where: {
        receiver_user_id: user.id,
        status: 'pending'
      },
      include: {
        sender: {
          select: { id: true, display_name: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({ data });
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

    const { invitation_id, action } = await request.json();

    if (!invitation_id || !action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const invitation = await prisma.couple_invitations.findFirst({
      where: {
        id: invitation_id,
        receiver_user_id: user.id,
        status: 'pending'
      }
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitación no encontrada' }, { status: 404 });
    }

    if (action === 'reject') {
      await prisma.couple_invitations.update({
        where: { id: invitation_id },
        data: {
          status: 'rejected',
          responded_at: new Date()
        }
      });

      return NextResponse.json({ message: 'Invitación rechazada' });
    }

    const newCouple = await prisma.couples.create({
      data: {
        relationship_start_date: new Date()
      }
    });

    if (!newCouple) {
      return NextResponse.json({ error: 'Error al crear la pareja' }, { status: 500 });
    }

    try {
      await prisma.couple_members.createMany({
        data: [
          { couple_id: newCouple.id, user_id: invitation.sender_user_id },
          { couple_id: newCouple.id, user_id: invitation.receiver_user_id }
        ]
      });
    } catch (membersError) {
      await prisma.couples.delete({ where: { id: newCouple.id } });
      return NextResponse.json({ error: 'Error al crear los miembros de la pareja' }, { status: 500 });
    }

    await prisma.couple_invitations.update({
      where: { id: invitation_id },
      data: {
        status: 'accepted',
        responded_at: new Date(),
        couple_id: newCouple.id
      }
    });

    return NextResponse.json({ message: 'Invitación aceptada', couple_id: newCouple.id });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
