import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Currency = 'USD' | 'VND';

export const EXCHANGE_RATE = 25400; // 1 USD = 25,400 VND

interface CurrencyState {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  toggleCurrency: () => void;
  exchangeRate: number;
  formatPrice: (amountInUSD: number) => string;
  toDisplayAmount: (amountInUSD: number) => number;
  toUSD: (amountInCurrentCurrency: number) => number;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: 'VND',
      exchangeRate: EXCHANGE_RATE,
      setCurrency: (currency: Currency) => set({ currency }),
      toggleCurrency: () => set(state => ({ currency: state.currency === 'USD' ? 'VND' : 'USD' })),
      toDisplayAmount: (amountInUSD: number) => {
        const { currency, exchangeRate } = get();
        if (currency === 'VND') {
          return Math.round(amountInUSD * exchangeRate);
        }
        return amountInUSD;
      },
      toUSD: (amountInCurrentCurrency: number) => {
        const { currency, exchangeRate } = get();
        if (currency === 'VND') {
          return amountInCurrentCurrency / exchangeRate;
        }
        return amountInCurrentCurrency;
      },
      formatPrice: (amountInUSD: number) => {
        const { currency, exchangeRate } = get();
        if (amountInUSD == null || isNaN(amountInUSD)) return '0 ₫';
        if (currency === 'VND') {
          return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
          }).format(Math.round(amountInUSD * exchangeRate));
        } else {
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(amountInUSD);
        }
      }
    }),
    {
      name: 'nova-currency-store',
    }
  )
);
