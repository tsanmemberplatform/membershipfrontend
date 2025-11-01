import { FileX } from "lucide-react";

interface EmptyStateProps {
  message: string;
}

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
      <FileX className="w-12 h-12 mb-3 text-gray-400" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
