import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // LOAD ITEMS FROM ASYNC STORAGE

      const storaged = await AsyncStorage.getItem('products');

      if (storaged) {
        setProducts(JSON.parse(storaged));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // ADD A NEW ITEM TO THE CART

      const exist = products.some(item => item.id === product.id);

      if (!exist) {
        const productsToSet = [...products, { ...product, quantity: 1 }];
        setProducts(productsToSet);
        await AsyncStorage.setItem('products', JSON.stringify(productsToSet));
      } else {
        const existendProducts = products.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );

        setProducts(existendProducts);
        AsyncStorage.setItem('products', JSON.stringify(existendProducts));
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART

      const productsIncremented = products.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      );

      setProducts(productsIncremented);
      await AsyncStorage.setItem(
        'products',
        JSON.stringify(productsIncremented),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const productsIncremented = products.map(item =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
      );

      setProducts(productsIncremented);
      await AsyncStorage.setItem(
        'products',
        JSON.stringify(productsIncremented),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
