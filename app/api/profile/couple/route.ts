import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: memberData, error: memberError } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', user.id)
    .single();

  if (memberError || !memberData) {
    return NextResponse.json({ error: 'Not in a couple' }, { status: 404 });
  }

  // Get couple information including relationship start date
  const { data: coupleData, error: coupleError } = await supabase
    .from('couples')
    .select('relationship_start_date')
    .eq('id', memberData.couple_id)
    .single();

  const { data: partners, error: partnersError } = await supabase
    .from('couple_members')
    .select(`
      user_id,
      profiles!inner(display_name)
    `)
    .eq('couple_id', memberData.couple_id);

  if (partnersError) {
    return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 });
  }

  const formattedPartners = partners?.map(p => ({
    user_id: p.user_id,
    display_name: (p.profiles as any)?.display_name || null
  })) || [];

  return NextResponse.json({
    currentUserId: user.id,
    partners: formattedPartners,
    relationshipStartDate: coupleData?.relationship_start_date || null
  });
}

export async function DELETE() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: memberData, error: memberError } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', user.id)
    .single();

  if (memberError || !memberData) {
    return NextResponse.json({ error: 'Not in a couple' }, { status: 404 });
  }

  const coupleId = memberData.couple_id;

  // Delete all related data in correct order (child tables first)
  // 1. Delete piggy_bank_loan_payments (references piggy_bank_loans)
  await supabase
    .from('piggy_bank_loan_payments')
    .delete()
    .eq('couple_id', coupleId);

  // 2. Delete all other tables that reference couples(id)
  await supabase.from('piggy_bank_loans').delete().eq('couple_id', coupleId);
  await supabase.from('piggy_bank_expenses').delete().eq('couple_id', coupleId);
  await supabase.from('todo_items').delete().eq('couple_id', coupleId);
  await supabase.from('intimacy_events').delete().eq('couple_id', coupleId);
  await supabase.from('contraceptive_events').delete().eq('couple_id', coupleId);
  await supabase.from('cycle_phases').delete().eq('couple_id', coupleId);
  await supabase.from('discussions').delete().eq('couple_id', coupleId);
  await supabase.from('important_events').delete().eq('couple_id', coupleId);
  await supabase.from('improvement_goals').delete().eq('couple_id', coupleId);
  
  // Update couple_invitations to remove couple_id reference (set to null)
  await supabase
    .from('couple_invitations')
    .update({ couple_id: null })
    .eq('couple_id', coupleId);

  // 3. Delete couple_members
  const { error: deleteMembersError } = await supabase
    .from('couple_members')
    .delete()
    .eq('couple_id', coupleId);

  if (deleteMembersError) {
    return NextResponse.json({ error: 'Failed to remove couple members: ' + deleteMembersError.message }, { status: 500 });
  }

  // 4. Finally delete the couple record
  const { error: deleteCoupleError } = await supabase
    .from('couples')
    .delete()
    .eq('id', coupleId);

  if (deleteCoupleError) {
    return NextResponse.json({ error: 'Failed to delete couple: ' + deleteCoupleError.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Relationship ended successfully' });
}
