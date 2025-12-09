// Domain Types
export interface User {
  id: string;
  email: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  gender: 'male' | 'female' | 'other' | null;
  invite_code: string | null;
  created_at: Date;
}

export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  gender: 'male' | 'female';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  profile: Profile;
}
