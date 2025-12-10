import { createClient } from '@/app/lib/supabase/server';
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

    const { data: coupleMember, error: coupleMemberError } = await supabase
      .from('couple_members')
      .select('couple_id')
      .eq('user_id', user.id)
      .single();

    if (coupleMemberError || !coupleMember) {
      return NextResponse.json({ error: 'No pertenece a ninguna pareja' }, { status: 404 });
    }

    // Verificar que el préstamo existe y obtener información
    const { data: loan, error: loanError } = await supabase
      .from('piggy_bank_loans')
      .select('*, lender:lender_user_id(display_name), borrower:borrower_user_id(display_name)')
      .eq('id', loan_id)
      .single();

    if (loanError || !loan) {
      return NextResponse.json({ error: 'Préstamo no encontrado' }, { status: 404 });
    }

    // Verificar que el usuario es el deudor
    if (loan.borrower_user_id !== user.id) {
      return NextResponse.json({ error: 'No autorizado para pagar este préstamo' }, { status: 403 });
    }

    // Obtener total pagado hasta ahora
    const { data: payments, error: paymentsError } = await supabase
      .from('piggy_bank_loan_payments')
      .select('amount')
      .eq('loan_id', loan_id);

    if (paymentsError) {
      return NextResponse.json({ error: paymentsError.message }, { status: 500 });
    }

    const totalPaid = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    const remaining = Number(loan.amount) - totalPaid;

    // Verificar que no se pague más de lo debido
    if (Number(amount) > remaining) {
      return NextResponse.json({ 
        error: `El monto excede la deuda restante de $${remaining.toLocaleString('es-CL')}` 
      }, { status: 400 });
    }

    // Registrar el pago
    const { data, error } = await supabase
      .from('piggy_bank_loan_payments')
      .insert({
        loan_id,
        couple_id: coupleMember.couple_id,
        payer_user_id: user.id,
        amount,
        notes: notes || null,
        payment_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Si el pago completa la deuda, actualizar el préstamo
    const newTotalPaid = totalPaid + Number(amount);
    if (newTotalPaid >= Number(loan.amount)) {
      await supabase
        .from('piggy_bank_loans')
        .update({ 
          settled: true,
          settled_at: new Date().toISOString()
        })
        .eq('id', loan_id);
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

    const { data: coupleMember, error: coupleMemberError } = await supabase
      .from('couple_members')
      .select('couple_id')
      .eq('user_id', user.id)
      .single();

    if (coupleMemberError || !coupleMember) {
      return NextResponse.json({ error: 'No pertenece a ninguna pareja' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('piggy_bank_loan_payments')
      .select(`
        *,
        payer:payer_user_id(display_name)
      `)
      .eq('loan_id', loanId)
      .eq('couple_id', coupleMember.couple_id)
      .order('payment_date', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
