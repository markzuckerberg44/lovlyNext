import { createClient } from '@/app/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Send invitation by invite code
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

    // Check if user already has a couple
    const { data: senderCouple, error: senderCoupleError } = await supabase
      .from('couple_members')
      .select('couple_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (senderCouple) {
      return NextResponse.json({ error: 'Ya estás en una relación' }, { status: 400 });
    }

    // Find receiver by invite code
    const { data: receiver, error: receiverError } = await supabase
      .from('profiles')
      .select('id, display_name')
      .eq('invite_code', invite_code)
      .single();

    if (receiverError || !receiver) {
      return NextResponse.json({ error: 'Código de invitación inválido' }, { status: 404 });
    }

    if (receiver.id === user.id) {
      return NextResponse.json({ error: 'No puedes enviarte una invitación a ti mismo' }, { status: 400 });
    }

    // Check if receiver already has a couple
    const { data: receiverCouple, error: receiverCoupleError } = await supabase
      .from('couple_members')
      .select('couple_id')
      .eq('user_id', receiver.id)
      .maybeSingle();

    if (receiverCouple) {
      return NextResponse.json({ error: 'Esta persona ya está en una relación' }, { status: 400 });
    }

    // Check if there's already a pending invitation
    const { data: existingInvitation, error: existingError } = await supabase
      .from('couple_invitations')
      .select('id')
      .eq('sender_user_id', user.id)
      .eq('receiver_user_id', receiver.id)
      .eq('status', 'pending')
      .maybeSingle();

    if (existingInvitation) {
      return NextResponse.json({ error: 'Ya existe una invitación pendiente' }, { status: 400 });
    }

    // Create invitation
    const { data, error } = await supabase
      .from('couple_invitations')
      .insert({
        sender_user_id: user.id,
        receiver_user_id: receiver.id,
        message: message || null,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, message: 'Invitación enviada' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// Get invitations received by current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('couple_invitations')
      .select(`
        *,
        sender:sender_user_id(id, display_name)
      `)
      .eq('receiver_user_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// Accept or reject invitation
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

    // Get invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('couple_invitations')
      .select('*')
      .eq('id', invitation_id)
      .eq('receiver_user_id', user.id)
      .eq('status', 'pending')
      .single();

    if (invitationError || !invitation) {
      return NextResponse.json({ error: 'Invitación no encontrada' }, { status: 404 });
    }

    if (action === 'reject') {
      // Just update status to rejected
      const { error: updateError } = await supabase
        .from('couple_invitations')
        .update({
          status: 'rejected',
          responded_at: new Date().toISOString()
        })
        .eq('id', invitation_id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ message: 'Invitación rechazada' });
    }

    // Accept invitation - create couple and couple_members
    const { data: newCouple, error: coupleError } = await supabase
      .from('couples')
      .insert({
        relationship_start_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (coupleError || !newCouple) {
      return NextResponse.json({ error: 'Error al crear la pareja' }, { status: 500 });
    }

    // Add both users to couple_members
    const { error: membersError } = await supabase
      .from('couple_members')
      .insert([
        { couple_id: newCouple.id, user_id: invitation.sender_user_id },
        { couple_id: newCouple.id, user_id: invitation.receiver_user_id }
      ]);

    if (membersError) {
      // Rollback - delete couple if members creation failed
      await supabase.from('couples').delete().eq('id', newCouple.id);
      return NextResponse.json({ error: 'Error al crear los miembros de la pareja' }, { status: 500 });
    }

    // Update invitation status
    const { error: updateError } = await supabase
      .from('couple_invitations')
      .update({
        status: 'accepted',
        responded_at: new Date().toISOString(),
        couple_id: newCouple.id
      })
      .eq('id', invitation_id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Invitación aceptada', couple_id: newCouple.id });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
