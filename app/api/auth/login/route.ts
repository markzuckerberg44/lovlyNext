import { NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || 'Error al iniciar sesión' },
        { status: 401 }
      );
    }

    try {
      const profileData = await prisma.profiles.findUnique({
        where: { id: authData.user.id },
        select: {
          id: true,
          display_name: true,
          gender: true,
          invite_code: true,
          created_at: true
        }
      });

      if (!profileData) {
        return NextResponse.json(
          { error: 'Perfil no encontrado' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        user: {
          id: authData.user.id,
          email: authData.user.email!,
        },
        profile: {
          id: profileData.id,
          display_name: profileData.display_name,
          gender: profileData.gender,
          invite_code: profileData.invite_code,
          created_at: profileData.created_at,
        },
      }, { status: 200 });
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Error de base de datos: ' + dbError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Error al iniciar sesión' },
      { status: 500 }
    );
  }
}
