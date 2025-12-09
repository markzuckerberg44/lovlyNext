interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export default function Button({ 
  variant = 'primary', 
  children, 
  className = '',
  ...props 
}: ButtonProps) {
  const baseStyles = 'w-full py-3 px-5 rounded-xl font-medium text-base transition-colors';
  const variants = {
    primary: 'bg-[#FF385C] text-white hover:bg-[#E31C5F]',
    secondary: 'bg-[#484848] text-white hover:bg-[#383838]'
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
