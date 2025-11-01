import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
      <div className="text-sm text-gray-600">
        Showing {startItem} to {endItem} of {totalItems.toLocaleString()}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {currentPage}/{totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Go to:</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
            defaultValue={currentPage}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const value = Number.parseInt(
                  (e.target as HTMLInputElement).value
                );
                if (value >= 1 && value <= totalPages) {
                  onPageChange(value);
                }
              }
            }}
          />
          <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium">
            Go
          </button>
        </div>
      </div>
    </div>
  );
}
