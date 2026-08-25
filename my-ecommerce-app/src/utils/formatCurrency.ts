import { useCurrencyStore } from '../core/store/currencyStore';

export const formatCurrency = (amount: number, _locale?: string) => {
  if (amount == null || isNaN(amount)) return '0';
  return useCurrencyStore.getState().formatPrice(amount);
};