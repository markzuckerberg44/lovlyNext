'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import InputField from '../molecules/InputField';
import Button from '../atoms/Button';
import Text from '../atoms/Text';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      // Login exitoso
      router.push('/homepage');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl">
          {error}
        </div>
      )}
      
      <InputField
        iconType="email"
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      
      <InputField
        iconType="password"
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <div className="text-center">
        <Text variant="link">¿Olvidaste tu contraseña?</Text>
      </div>

      <Button type="submit" variant="primary" disabled={isLoading}>
        {isLoading ? 'Cargando...' : 'Continuar'}
      </Button>
    </form>
  );
}
