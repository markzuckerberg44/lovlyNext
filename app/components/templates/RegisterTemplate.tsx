import RegisterHeader from '../molecules/RegisterHeader';
import RegisterForm from '../organisms/RegisterForm';
import Divider from '../molecules/Divider';
import Button from '../atoms/Button';
import Text from '../atoms/Text';
import Link from 'next/link';

export default function RegisterTemplate() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-6">
        <RegisterHeader />
        <RegisterForm />
        <Divider text="¿Ya tienes cuenta?" />
        <Link href="/login">
          <Button variant="secondary" type="button">Iniciar sesión</Button>
        </Link>
        <Text variant="caption" className="text-center mt-5 px-3">
          Al presionar "Crear cuenta", he leído y aceptado con los términos y condiciones
        </Text>
      </div>
    </div>
  );
}
