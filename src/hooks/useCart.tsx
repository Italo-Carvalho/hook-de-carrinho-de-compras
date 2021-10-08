import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const productExistsInCart = cart.find(product => product.id === productId)
      const { data } = await api.get('/products/' + productId);

      if (productExistsInCart) {
        updateProductAmount({
          productId: productId,
          amount: productExistsInCart.amount + 1,
        })
      } else {
        const normalizedProduct = { ...data, amount: 1 }
        const newCart = [
          ...cart,
          normalizedProduct
        ]
        setCart(newCart)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));

      }
    } catch {
      console.log('produto não exite')
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {

      const newCart = cart.map(
        product => product.id !== productId ? product : { ...product, amount })
      localStorage.setItem(`@RocketShoes:cart`, JSON.stringify(newCart))
      setCart(newCart)

    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
