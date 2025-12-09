import { NextResponse } from 'next/server';
import { SupabaseAuthRepository } from '@/app/lib/repositories/supabase-auth.repository';
import { LoginUseCase } from '@/app/lib/usecases/auth.usecases';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const authRepository = new SupabaseAuthRepository();
    const loginUseCase = new LoginUseCase(authRepository);

    const result = await loginUseCase.execute({ email, password });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al iniciar sesión' },
      { status: 401 }
    );
  }
}
