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

    const { amount, description, borrower_user_id, lender_user_id, loan_date } = await request.json();

    if (!amount || !borrower_user_id) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    const coupleMember = await prisma.couple_members.findFirst({
      where: { user_id: user.id },
      select: { couple_id: true }
    });

    if (!coupleMember) {
      return NextResponse.json({ error: 'No pertenece a ninguna pareja' }, { status: 404 });
    }

    const data = await prisma.piggy_bank_loans.create({
      data: {
        couple_id: coupleMember.couple_id,
        lender_user_id: lender_user_id || user.id,
        borrower_user_id,
        amount,
        description: description || null,
        loan_date: loan_date ? new Date(loan_date) : new Date(),
        settled: false,
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

    const data = await prisma.piggy_bank_loans.findMany({
      where: { couple_id: coupleMember.couple_id },
      include: {
        lender: { select: { display_name: true } },
        borrower: { select: { display_name: true } }
      },
      orderBy: { loan_date: 'desc' }
    });

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

    const { id, settled } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 });
    }

    const updateData: any = { settled };
    if (settled) {
      updateData.settled_at = new Date();
    }

    const data = await prisma.piggy_bank_loans.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
