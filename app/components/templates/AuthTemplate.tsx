import LoginHeader from '../molecules/LoginHeader';
import LoginForm from '../organisms/LoginForm';
import Divider from '../molecules/Divider';
import Button from '../atoms/Button';
import Text from '../atoms/Text';
import Link from 'next/link';

export default function AuthTemplate() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-6">
        <LoginHeader />
        <LoginForm />
        <Divider text="¿Aun no tienes cuenta?" />
        <Link href="/register">
          <Button variant="secondary" type="button">Crear cuenta</Button>
        </Link>
        <Text variant="caption" className="text-center mt-5 px-3">
          Al presionar "Continuar", he leído y aceptado con los términos y condiciones
        </Text>
      </div>
    </div>
  );
}
