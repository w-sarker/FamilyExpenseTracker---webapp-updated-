/**
 * Format number to Taka currency
 * @param {number} amount
 * @returns {string} e.g. "৳ 1,250.00"
 */
export function formatCurrency(amount) {
  if (typeof amount !== "number") return "৳ 0.00";

  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
  })
    .format(amount)
    .replace("BDT", "৳");
  // Native BDT usually shows BDT or Tk, we force ৳ symbol if needed or use native if system supports it.
  // 'en-BD' might produce 'Tk ' or 'BDT '. The user specifically asked for ৳.
  // Let's force the symbol replacement just in case.
}

// Default export used throughout the app
export default formatCurrency;
