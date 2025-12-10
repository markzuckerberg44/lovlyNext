import { NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, displayName, gender } = body;

    console.log('Register attempt for:', email);

    if (!email || !password || !displayName || !gender) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Create auth user
    console.log('Creating auth user...');
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
      console.error('No user returned from signup');
      return NextResponse.json(
        { error: 'No se pudo crear el usuario' },
        { status: 400 }
      );
    }

    if (authData.user.identities && authData.user.identities.length === 0) {
      console.error('Email already registered');
      return NextResponse.json(
        { error: 'Este email ya está registrado. Por favor inicia sesión.' },
        { status: 400 }
      );
    }

    console.log('Auth user created:', authData.user.id);

    // Create profile in public.profiles table
    // The invite_code will be generated automatically by the database trigger
    console.log('Creating profile...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        display_name: displayName,
        gender: gender,
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return NextResponse.json(
        { error: `Error al crear perfil: ${profileError.message}` },
        { status: 400 }
      );
    }

    console.log('Profile created successfully:', profileData);

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
