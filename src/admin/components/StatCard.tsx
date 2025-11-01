interface StatCardProps {
  label: string;
  value: string | number | undefined;
  loading?: boolean;
}

export default function StatCard({
  label,
  value,
  loading = false,
}: StatCardProps) {
  // console.log("StatCard rendering with:", { label, value, loading });
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="text-sm text-gray-600 mb-2">{label}</div>
      {loading ? (
        <div className="text-3xl font-bold">
          <div className="h-9 bg-gray-200 rounded animate-pulse"></div>
        </div>
      ) : (
        <div className="text-3xl font-bold text-gray-900">{value}</div>
      )}
    </div>
  );
}
