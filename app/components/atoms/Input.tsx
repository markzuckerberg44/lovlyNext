interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export default function Input({ icon, className = '', ...props }: InputProps) {
  return (
    <div className="relative w-full">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
      <input
        className={`w-full py-3.5 px-4 ${icon ? 'pl-12' : ''} bg-[#F0F0F0] rounded-xl text-sm text-opacity-40 placeholder:text-gray-400 focus:placeholder:opacity-0 focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:bg-[#E5E5E5] autofill:bg-[#F0F0F0] transition-colors ${className}`}
        style={{
          WebkitBoxShadow: '0 0 0 1000px #F0F0F0 inset',
          WebkitTextFillColor: 'rgba(0, 0, 0, 0.4)'
        }}
        {...props}
      />
    </div>
  );
}
