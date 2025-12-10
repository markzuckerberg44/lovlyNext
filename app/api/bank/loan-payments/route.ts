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

    const { loan_id, amount, notes } = await request.json();

    if (!loan_id || !amount) {
      return NextResponse.json({ error: 'loan_id y amount son requeridos' }, { status: 400 });
    }

    const coupleMember = await prisma.couple_members.findFirst({
      where: { user_id: user.id },
      select: { couple_id: true }
    });

    if (!coupleMember) {
      return NextResponse.json({ error: 'No pertenece a ninguna pareja' }, { status: 404 });
    }

    const loan = await prisma.piggy_bank_loans.findUnique({
      where: { id: loan_id },
      include: {
        lender: { select: { display_name: true } },
        borrower: { select: { display_name: true } }
      }
    });

    if (!loan) {
      return NextResponse.json({ error: 'Préstamo no encontrado' }, { status: 404 });
    }

    if (loan.borrower_user_id !== user.id) {
      return NextResponse.json({ error: 'No autorizado para pagar este préstamo' }, { status: 403 });
    }

    const payments = await prisma.piggy_bank_loan_payments.findMany({
      where: { loan_id },
      select: { amount: true }
    });

    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const remaining = Number(loan.amount) - totalPaid;

    if (Number(amount) > remaining) {
      return NextResponse.json({ 
        error: `El monto excede la deuda restante de $${remaining.toLocaleString('es-CL')}` 
      }, { status: 400 });
    }

    const data = await prisma.piggy_bank_loan_payments.create({
      data: {
        loan_id,
        couple_id: coupleMember.couple_id,
        payer_user_id: user.id,
        amount,
        notes: notes || null,
        payment_date: new Date()
      }
    });

    const newTotalPaid = totalPaid + Number(amount);
    if (newTotalPaid >= Number(loan.amount)) {
      await prisma.piggy_bank_loans.update({
        where: { id: loan_id },
        data: { 
          settled: true,
          settled_at: new Date()
        }
      });
    }

    return NextResponse.json({ data, remaining: remaining - Number(amount) }, { status: 201 });
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

    const { searchParams } = new URL(request.url);
    const loanId = searchParams.get('loan_id');

    if (!loanId) {
      return NextResponse.json({ error: 'loan_id es requerido' }, { status: 400 });
    }

    const coupleMember = await prisma.couple_members.findFirst({
      where: { user_id: user.id },
      select: { couple_id: true }
    });

    if (!coupleMember) {
      return NextResponse.json({ error: 'No pertenece a ninguna pareja' }, { status: 404 });
    }

    const data = await prisma.piggy_bank_loan_payments.findMany({
      where: { 
        loan_id: loanId,
        couple_id: coupleMember.couple_id
      },
      include: {
        payer: { select: { display_name: true } }
      },
      orderBy: { payment_date: 'desc' }
    });

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
