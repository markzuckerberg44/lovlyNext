import { NextResponse } from 'next/server';
import { SupabaseAuthRepository } from '@/app/lib/repositories/supabase-auth.repository';
import { RegisterUseCase } from '@/app/lib/usecases/auth.usecases';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, displayName, gender } = body;

    // Dependency Injection
    const authRepository = new SupabaseAuthRepository();
    const registerUseCase = new RegisterUseCase(authRepository);

    const result = await registerUseCase.execute({
      email,
      password,
      displayName,
      gender,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: error.message || 'Error al registrar usuario' },
      { status: 400 }
    );
  }
}
