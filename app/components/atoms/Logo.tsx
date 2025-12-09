import Image from 'next/image';

export default function Logo() {
  return (
    <div className="w-14 h-14 flex items-center justify-center">
      <Image 
        src="/lovlylogo.png" 
        alt="Lovly Logo" 
        width={56} 
        height={56}
        style={{ width: 'auto', height: 'auto' }}
        className="max-w-full max-h-full object-contain"
      />
    </div>
  );
}
