import Input from '../atoms/Input';
import Icon from '../atoms/Icon';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  iconType: 'email' | 'password';
}

export default function InputField({ iconType, ...props }: InputFieldProps) {
  return (
    <Input 
      icon={<Icon type={iconType} />}
      {...props}
    />
  );
}
