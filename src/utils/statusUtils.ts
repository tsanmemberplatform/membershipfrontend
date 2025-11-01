export const getStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'pending':
    case 'false':
    case 'unverified':
      return 'text-yellow-600';
    case 'approved':
    case 'verified':
    case 'active':
    case 'true':
      return 'text-green-600';
    case 'rejected':
    case 'inactive':
    case 'suspended':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

export const getStatusDot = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'pending':
    case 'false':
    case 'unverified':
      return 'bg-yellow-400';
    case 'approved':
    case 'verified':
    case 'active':
    case 'true':
      return 'bg-green-400';
    case 'rejected':
    case 'inactive':
    case 'suspended':
      return 'bg-red-400';
    default:
      return 'bg-gray-400';
  }
};
