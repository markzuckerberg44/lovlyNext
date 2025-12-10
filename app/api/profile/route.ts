import { createClient } from '@/app/lib/supabase/server';
import { prisma } from '@/app/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const profile = await prisma.profiles.findUnique({
      where: { id: user.id },
      select: { display_name: true, invite_code: true }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 500 });
    }

    return NextResponse.json({ 
      display_name: profile.display_name || null,
      invite_code: profile.invite_code || null,
      email: user.email
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
