
import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product } from '../types';

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

  function setCartAndSave(cart: Product[]) {
    setCart(cart);
    localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));
  }

  const addProduct = async (productId: number) => {
    try {
      const productExistsInCart = cart.find(product => product.id === productId)
      const { data } = await api.get('/products/' + productId);
      const successAlert = () => toast.success("Produto adicionado ao carrinho.");

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
        setCartAndSave(newCart)
        successAlert()



      }
    } catch {
      console.log('produto não exite')
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const productExistsInCart = cart.find(product => product.id === productId)
      if (!productExistsInCart) {
        throw new Error("Este produto não existe.");
      }
      const newCart = cart.filter(product => product.id !== productId)
      setCartAndSave(newCart);
      toast.info("Produto removido.");


    } catch (err) {
      if (err instanceof Error) {
        toast.error(String(err.message));
      }
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount > 0) {
        const newCart = cart.map(
          product => product.id !== productId ? product : { ...product, amount })
        setCartAndSave(newCart)
      } else {
        throw new Error("Quantidade mínima atingida.");
      }
    } catch (err) {
      if (err instanceof Error) {
        toast.error(String(err.message));
      }
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
