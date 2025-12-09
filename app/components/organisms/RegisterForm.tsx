'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import InputField from '../molecules/InputField';
import GenderSelector from '../molecules/GenderSelector';
import Button from '../atoms/Button';
import Text from '../atoms/Text';

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    gender: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGenderChange = (gender: string) => {
    setFormData({
      ...formData,
      gender
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName,
          gender: formData.gender,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear cuenta');
      }

      // Registro exitoso, mostrar mensaje de confirmación
      setSuccess(true);
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
      
      {success && (
        <div className="bg-green-50 text-green-600 text-xs p-3 rounded-xl">
          ¡Cuenta creada! Por favor revisa tu correo ({formData.email}) para confirmar tu cuenta.
        </div>
      )}
      
      <InputField
        iconType="email"
        type="text"
        name="displayName"
        placeholder="Nombre"
        value={formData.displayName}
        onChange={handleChange}
        required
      />

      <InputField
        iconType="email"
        type="email"
        name="email"
        placeholder="E-mail"
        value={formData.email}
        onChange={handleChange}
        required
      />
      
      <InputField
        iconType="password"
        type="password"
        name="password"
        placeholder="Contraseña"
        value={formData.password}
        onChange={handleChange}
        required
      />

      <InputField
        iconType="password"
        type="password"
        name="confirmPassword"
        placeholder="Confirmar contraseña"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
      />

      <div>
        <Text variant="body" className="mb-2 text-gray-600">Género</Text>
        <GenderSelector value={formData.gender} onChange={handleGenderChange} />
      </div>

      <Button type="submit" variant="primary" disabled={isLoading || !formData.gender}>
        {isLoading ? 'Cargando...' : 'Crear cuenta'}
      </Button>
    </form>
  );
}
