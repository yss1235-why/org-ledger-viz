/**
 * Formats a number as Indian Rupees with proper comma separation
 * Example: 100000 => ₹1,00,000.00
 */
export const formatCurrency = (amount: number): string => {
  // Convert to Indian numbering system
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount);
};

/**
 * Formats amount for display with color coding
 * Positive (income) shows with + prefix
 * Negative (expense) shows with - prefix
 */
export const formatTransactionAmount = (amount: number, type: 'income' | 'expense'): string => {
  const formatted = formatCurrency(Math.abs(amount));
  return type === 'income' ? `+${formatted}` : `-${formatted}`;
};
