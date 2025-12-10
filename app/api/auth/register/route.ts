import { NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, displayName, gender } = body;

    const supabase = await createClient();

    // Create auth user
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

    if (authData.user.identities && authData.user.identities.length === 0) {
      return NextResponse.json(
        { error: 'Este email ya está registrado. Por favor inicia sesión.' },
        { status: 400 }
      );
    }

    // Create profile in public.profiles table
    // The invite_code will be generated automatically by the database trigger
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        display_name: displayName,
        gender: gender,
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // If profile creation fails, we should delete the auth user
      // but for now just log the error
      return NextResponse.json(
        { error: 'Error al crear perfil de usuario' },
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
