import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';

export interface CartItem {
  product: Product;
  quantity: number;
}

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // LocalStorage'dan sepeti yükle (sadece component mount olduğunda)
  useEffect(() => {
    const savedCart = localStorage.getItem('numa-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Sepet verisi okunurken hata:', error);
        localStorage.removeItem('numa-cart'); // Bozuk veriyi temizle
      }
    }
  }, []);

  // Sepeti localStorage'a kaydet (sadece sepet içeriği değiştiğinde)
  useEffect(() => {
    // Boş sepeti kaydetmemek için kontrol.
    // Sepet temizlendiğinde 'numa-cart' anahtarını kaldırmak daha iyi bir pratik.
    if (cartItems.length > 0) {
      localStorage.setItem('numa-cart', JSON.stringify(cartItems));
    } else {
      // Sepet boşsa localStorage'dan da temizle
      localStorage.removeItem('numa-cart');
    }
  }, [cartItems]);

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    setCartItems(prevCartItems => {
      const existingItem = prevCartItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // Ürün zaten sepette, miktarını artır
        return prevCartItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Yeni ürün, sepete ekle
        return [...prevCartItems, { product, quantity }];
      }
    });

    // NOT: Bildirim gösterme gibi yan etkiler (side effects) hook içerisinde
    // yapılmamalıdır. Bu tür işlemler, bu fonksiyonu çağıran component'te
    // veya bir bildirim context/servisi aracılığıyla yönetilmelidir.
    // Örnek: toast.success(`${product.name} sepete eklendi!`);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      // Miktar 0 veya daha az ise ürünü sepetten kaldır
      removeFromCart(productId);
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }, [cartItems]);

  const getCartItemCount = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  return {
    cartItems,
    isCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    openCart,
    closeCart
  };
};