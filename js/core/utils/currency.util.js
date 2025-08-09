// Currency utilities
// Implement formatILS here and keep a global alias for backward compatibility

window.App = window.App || {};
window.App.Utils = window.App.Utils || {};
window.App.Utils.Currency = {
  formatILS(amount) {
    const num = parseFloat(amount || 0);
    const sign = num < 0 ? '-' : '';
    const abs = Math.abs(num).toFixed(2);
    // Always format as: -100.00₪ (minus sign, number, symbol)
    return `<span class="num-ltr">${sign}${abs}₪</span>`;
  },
  
  formatPercent(amount, decimals = 2) {
    const num = parseFloat(amount || 0);
    const sign = num < 0 ? '-' : '';
    const abs = Math.abs(num).toFixed(decimals);
    // Always format as: -15.50% (minus sign, number, symbol)
    return `<span class="num-ltr">${sign}${abs}%</span>`;
  }
};

// Backward-compatible global functions
window.formatILS = window.App.Utils.Currency.formatILS;
window.formatPercent = window.App.Utils.Currency.formatPercent;
