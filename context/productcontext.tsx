import React, {
  createContext,
  useContext,
  useState,
} from "react";

type ProductType = {
  id: string;
  name: string;
  hpp: number;
  hargaJual: number;
  stock: number;
};

type ProductContextType = {
  products: ProductType[];

  setProducts: React.Dispatch<
    React.SetStateAction<ProductType[]>
  >;
};

const ProductContext =
  createContext<ProductContextType | null>(
    null
  );

export function ProductProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [products, setProducts] = useState<
    ProductType[]
  >([]);

  return (
    <ProductContext.Provider
      value={{
        products,
        setProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProduct() {
  const context =
    useContext(ProductContext);

  if (!context) {
    throw new Error(
      "useProduct harus dipakai dalam ProductProvider"
    );
  }

  return context;
}