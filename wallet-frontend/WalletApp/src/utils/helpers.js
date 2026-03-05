// Add this function - it was missing
export const validateMobile = (mobile) => {
  return /^[6-9]\d{9}$/.test(mobile);
};

export const validateAmount = (amount) => {
  return !isNaN(amount) && amount > 0;
};

export const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Simple date formatting without moment
export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const maskMobile = (mobile) => {
  if (!mobile) return '';
  const str = mobile.toString();
  return str.slice(0, 2) + '****' + str.slice(-2);
};

export const truncateText = (text, length = 20) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};