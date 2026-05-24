export const formatIDR = (amount: number | string | null | undefined): string => {
  if (amount === null || amount === undefined || amount === '') return 'Rp0';
  const val = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(val)) return 'Rp0';
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(val).replace(/\s/g, '');
};
