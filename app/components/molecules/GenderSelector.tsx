'use client';

interface GenderSelectorProps {
  value: string;
  onChange: (gender: string) => void;
}

export default function GenderSelector({ value, onChange }: GenderSelectorProps) {
  return (
    <div className="flex gap-3 w-full">
      <button
        type="button"
        onClick={() => onChange('male')}
        className={`flex-1 py-3.5 px-4 rounded-xl text-sm font-medium transition-colors ${
          value === 'male'
            ? 'bg-[#FF385C] text-white'
            : 'bg-[#F0F0F0] text-gray-600 hover:bg-[#E5E5E5]'
        }`}
      >
        Hombre
      </button>
      <button
        type="button"
        onClick={() => onChange('female')}
        className={`flex-1 py-3.5 px-4 rounded-xl text-sm font-medium transition-colors ${
          value === 'female'
            ? 'bg-[#FF385C] text-white'
            : 'bg-[#F0F0F0] text-gray-600 hover:bg-[#E5E5E5]'
        }`}
      >
        Mujer
      </button>
    </div>
  );
}
