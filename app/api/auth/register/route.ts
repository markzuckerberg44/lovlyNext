import { NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, displayName, gender } = body;

    if (!email || !password || !displayName || !gender) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Create auth user - profile will be created automatically by database trigger
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          gender,
        }
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: authError.message || 'Error al crear usuario' },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'No se pudo crear el usuario' },
        { status: 400 }
      );
    }

    // Check if email already exists
    if (authData.user.identities && authData.user.identities.length === 0) {
      return NextResponse.json(
        { error: 'Este email ya está registrado. Por favor inicia sesión.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      user: {
        id: authData.user.id,
        email: authData.user.email!,
      },
      message: 'Usuario registrado exitosamente',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: error.message || 'Error al registrar usuario' },
      { status: 400 }
    );
  }
}
