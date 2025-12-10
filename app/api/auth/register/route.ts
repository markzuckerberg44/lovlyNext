import { NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { prisma } from '@/app/lib/prisma';

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

    // Create auth user (Supabase Auth is still needed for authentication)
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

    if (authData.user.identities && authData.user.identities.length === 0) {
      return NextResponse.json(
        { error: 'Este email ya está registrado. Por favor inicia sesión.' },
        { status: 400 }
      );
    }

    // Create profile using Prisma ORM
    try {
      await prisma.profiles.create({
        data: {
          id: authData.user.id,
          display_name: displayName,
          gender: gender,
        },
      });
    } catch (profileErr) {
      console.error('Prisma profile creation error:', profileErr);
      // Continue anyway, profile can be created later
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
