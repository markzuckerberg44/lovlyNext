import { NextResponse } from 'next/server';
import { SupabaseAuthRepository } from '@/app/lib/repositories/supabase-auth.repository';
import { LogoutUseCase } from '@/app/lib/usecases/auth.usecases';

export async function POST() {
  try {
    const authRepository = new SupabaseAuthRepository();
    const logoutUseCase = new LogoutUseCase(authRepository);

    await logoutUseCase.execute();

    return NextResponse.json({ message: 'Sesión cerrada exitosamente' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al cerrar sesión' },
      { status: 400 }
    );
  }
}
