import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';

export interface CartItem {
  product: Product;
  quantity: number;
}

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // LocalStorage'dan sepeti yükle
  useEffect(() => {
    const savedCart = localStorage.getItem('numa-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('numa-cart'); // Bozuk data'yı temizle
      }
    }
  }, []);

  // Sepeti localStorage'a kaydet
  useEffect(() => {
    if (cartItems.length > 0 || localStorage.getItem('numa-cart')) {
      localStorage.setItem('numa-cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    setIsUpdating(true);
    
    setCartItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      
      let newCart;
      if (existingItem) {
        newCart = prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newCart = [...prev, { product, quantity }];
      }
      
      // Anlık bildirim göster
      setTimeout(() => {
        const existingNotification = document.querySelector('.cart-notification');
        if (existingNotification) {
          existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = 'cart-notification fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-[9999] transform transition-all duration-300';
        notification.innerHTML = `
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Sepete eklendi!</span>
          </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          if (notification.parentElement) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
          }
        }, 2000);
        
        setIsUpdating(false);
      }, 100);
      
      return newCart;
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setIsUpdating(true);
    setCartItems(prev => {
      const newCart = prev.filter(item => item.product.id !== productId);
      setTimeout(() => setIsUpdating(false), 100);
      return newCart;
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setIsUpdating(true);
    setCartItems(prev => {
      const newCart = prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      );
      setTimeout(() => setIsUpdating(false), 100);
      return newCart;
    });
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setIsUpdating(true);
    setCartItems([]);
    localStorage.removeItem('numa-cart');
    setTimeout(() => setIsUpdating(false), 100);
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
    isUpdating,
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