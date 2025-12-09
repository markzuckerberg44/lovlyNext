import Logo from '../atoms/Logo';
import Text from '../atoms/Text';

export default function RegisterHeader() {
  return (
    <div className="flex flex-col items-center gap-4 mb-6">
      <Logo />
      <div className="text-center">
        <Text variant="title" className="mb-1">Crear Cuenta</Text>
        <Text variant="subtitle">
          Ingresa tus datos para crear una cuenta nueva
        </Text>
      </div>
    </div>
  );
}
