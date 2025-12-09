import Text from '../atoms/Text';

interface DividerProps {
  text: string;
}

export default function Divider({ text }: DividerProps) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-gray-300" />
      <Text variant="body" className="text-gray-400">{text}</Text>
      <div className="flex-1 h-px bg-gray-300" />
    </div>
  );
}
