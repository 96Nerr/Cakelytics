import React, { createContext, useContext, useState } from "react";

export interface TransactionItem {
  name: string;
  qty: number;
  price: number;
  // cart.tsx fields (optional agar kompatibel)
  productId?: number;
  productName?: string;
  subtotal?: number;
}

export interface Transaction {
  id: string | number;
  trxCode: string;
  date: string;
  time?: string;
  total: number;
  items: TransactionItem[];
}

type TransactionContextType = {
  transactions: Transaction[];
  addTransaction: (trx: Transaction) => void;
  clearTransactions: () => void;
};

const TransactionContext = createContext<TransactionContextType | null>(null);

export const TransactionProvider = ({ children }: any) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const addTransaction = (trx: Transaction) => {
    // Normalise items: cart.tsx pakai productName & subtotal,
    // riwayat.tsx pakai name & price — pastikan kedua field tersedia
    const normalised: Transaction = {
      ...trx,
      time: trx.time ?? new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      items: trx.items.map((item) => ({
        ...item,
        // Jika dari cart.tsx: salin productName → name, subtotal/qty → price
        name: item.name ?? item.productName ?? "",
        price: item.price ?? (item.subtotal && item.qty ? item.subtotal / item.qty : 0),
      })),
    };
    setTransactions((prev) => [normalised, ...prev]);
  };

  const clearTransactions = () => {
    setTransactions([]);
  };

  return (
    <TransactionContext.Provider
      value={{ transactions, addTransaction, clearTransactions }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) throw new Error("useTransactions must be used inside Provider");
  return context;
};
