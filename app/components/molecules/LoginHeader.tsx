import Logo from '../atoms/Logo';
import Text from '../atoms/Text';

export default function LoginHeader() {
  return (
    <div className="flex flex-col items-center gap-4 mb-6">
      <Logo />
      <div className="text-center">
        <Text variant="title" className="mb-1">Iniciar Sesion</Text>
        <Text variant="subtitle">
          Para entrar a tu cuenta, ingresa tu email y contraseña
        </Text>
      </div>
    </div>
  );
}
