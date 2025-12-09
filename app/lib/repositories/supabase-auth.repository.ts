import { supabase } from '../supabase/client';
import { IAuthRepository } from './auth.repository.interface';
import { AuthResponse, LoginData, RegisterData } from '../domain/auth.types';

export class SupabaseAuthRepository implements IAuthRepository {
  async register(data: RegisterData): Promise<AuthResponse> {
    // Crear usuario en auth.users con metadatos
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          display_name: data.displayName,
          gender: data.gender,
        }
      }
    });

    if (authError) {
      throw new Error(authError.message || 'Error al crear usuario');
    }

    if (!authData.user) {
      throw new Error('No se pudo crear el usuario');
    }

    // Verificar si el email ya está registrado
    if (authData.user.identities && authData.user.identities.length === 0) {
      throw new Error('Este email ya está registrado. Por favor inicia sesión.');
    }

    // El perfil se creará automáticamente cuando el usuario confirme su email
    // mediante el trigger de base de datos
    return {
      user: {
        id: authData.user.id,
        email: authData.user.email!,
      },
      profile: {
        id: authData.user.id,
        display_name: data.displayName,
        gender: data.gender,
        invite_code: null,
        created_at: new Date(),
      },
    };
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Error al iniciar sesión');
    }

    // Obtener perfil
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      throw new Error(profileError.message);
    }

    return {
      user: {
        id: authData.user.id,
        email: authData.user.email!,
      },
      profile: {
        id: profileData.id,
        display_name: profileData.display_name,
        gender: profileData.gender,
        invite_code: profileData.invite_code,
        created_at: new Date(profileData.created_at),
      },
    };
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  async getCurrentUser(): Promise<AuthResponse | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw new Error(profileError.message);
    }

    return {
      user: {
        id: user.id,
        email: user.email!,
      },
      profile: {
        id: profileData.id,
        display_name: profileData.display_name,
        gender: profileData.gender,
        invite_code: profileData.invite_code,
        created_at: new Date(profileData.created_at),
      },
    };
  }
}
