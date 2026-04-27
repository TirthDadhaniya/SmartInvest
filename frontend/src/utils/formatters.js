export const formatINR = value => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return 'Rs 0.00';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercent = value => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '0.00%';
  return `${Number(value).toFixed(2)}%`;
};

export const formatNAV = value => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return 'Rs 0.00';
  return `Rs ${Number(value).toFixed(2)}`;
};

export const formatUnits = value => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '0.00 units';
  return `${Number(value).toFixed(2)} units`;
};
