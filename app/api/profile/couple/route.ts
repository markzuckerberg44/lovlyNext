import { createClient } from '@/app/lib/supabase/server';
import { prisma } from '@/app/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const memberData = await prisma.couple_members.findFirst({
    where: { user_id: user.id },
    select: { couple_id: true }
  });

  if (!memberData) {
    return NextResponse.json({ error: 'Not in a couple' }, { status: 404 });
  }

  const coupleData = await prisma.couples.findUnique({
    where: { id: memberData.couple_id },
    select: { relationship_start_date: true }
  });

  const partners = await prisma.couple_members.findMany({
    where: { couple_id: memberData.couple_id },
    include: {
      profiles: {
        select: { display_name: true }
      }
    }
  });

  const formattedPartners = partners.map(p => ({
    user_id: p.user_id,
    display_name: p.profiles?.display_name || null
  }));

  return NextResponse.json({
    currentUserId: user.id,
    partners: formattedPartners,
    relationshipStartDate: coupleData?.relationship_start_date || null
  });
}

export async function DELETE() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const memberData = await prisma.couple_members.findFirst({
    where: { user_id: user.id },
    select: { couple_id: true }
  });

  if (!memberData) {
    return NextResponse.json({ error: 'Not in a couple' }, { status: 404 });
  }

  const coupleId = memberData.couple_id;

  await prisma.$transaction([
    prisma.piggy_bank_loan_payments.deleteMany({ where: { couple_id: coupleId } }),
    prisma.piggy_bank_loans.deleteMany({ where: { couple_id: coupleId } }),
    prisma.piggy_bank_expenses.deleteMany({ where: { couple_id: coupleId } }),
    prisma.todo_items.deleteMany({ where: { couple_id: coupleId } }),
    prisma.intimacy_events.deleteMany({ where: { couple_id: coupleId } }),
    prisma.contraceptive_events.deleteMany({ where: { couple_id: coupleId } }),
    prisma.cycle_phases.deleteMany({ where: { couple_id: coupleId } }),
    prisma.discussions.deleteMany({ where: { couple_id: coupleId } }),
    prisma.important_events.deleteMany({ where: { couple_id: coupleId } }),
    prisma.improvement_goals.deleteMany({ where: { couple_id: coupleId } }),
    prisma.couple_invitations.updateMany({ 
      where: { couple_id: coupleId },
      data: { couple_id: null }
    }),
    prisma.couple_members.deleteMany({ where: { couple_id: coupleId } }),
    prisma.couples.delete({ where: { id: coupleId } })
  ]);

  return NextResponse.json({ message: 'Relationship ended successfully' });
}
