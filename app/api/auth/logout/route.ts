import { NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Error al cerrar sesión' },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: 'Sesión cerrada exitosamente' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al cerrar sesión' },
      { status: 400 }
    );
  }
}
