/**
 * Format a number to Indian Rupees (INR) format with ₹ symbol.
 * Example: 15420.5 => ₹15,420.50
 */
export const formatCurrency = (amount) => {
  const num = parseFloat(amount) || 0;
  return `₹${num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format a number to Indian Rupees with explicit +/- sign.
 * Example: 1500, 'income' => +₹1,500.00
 * Example: 250, 'expense' => -₹250.00
 */
export const formatCurrencyWithSign = (amount, type) => {
  const num = parseFloat(amount) || 0;
  const formatted = Math.abs(num).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (type === 'income') return `+₹${formatted}`;
  if (type === 'expense') return `-₹${formatted}`;

  return num >= 0 ? `₹${formatted}` : `-₹${formatted}`;
};
