interface TextProps {
  children: React.ReactNode;
  variant?: 'title' | 'subtitle' | 'body' | 'caption' | 'link';
  className?: string;
}

export default function Text({ children, variant = 'body', className = '' }: TextProps) {
  const variants = {
    title: 'text-2xl font-bold text-gray-900',
    subtitle: 'text-sm text-gray-600',
    body: 'text-xs text-gray-700',
    caption: 'text-xs text-gray-400',
    link: 'text-xs text-gray-900 hover:underline cursor-pointer'
  };

  return <p className={`${variants[variant]} ${className}`}>{children}</p>;
}
