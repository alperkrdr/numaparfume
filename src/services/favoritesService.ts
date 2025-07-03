import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, query, where, addDoc, deleteDoc } from 'firebase/firestore';
import { UserFavorites, UserCart, CartItem } from '../types';

export class FavoritesService {
  private static favoritesCollection = 'user_favorites';
  private static cartCollection = 'user_cart';

  /**
   * Kullanıcının favori ürünlerini al
   */
  static async getUserFavorites(userId: string, userEmail: string): Promise<string[]> {
    try {
      const q = query(
        collection(db, this.favoritesCollection),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const favData = snapshot.docs[0].data() as UserFavorites;
        return favData.productIds || [];
      }
      
      return [];
    } catch (error) {
      console.error('❌ Favoriler alınırken hata:', error);
      return [];
    }
  }

  /**
   * Favorilere ürün ekle/çıkar
   */
  static async toggleFavorite(userId: string, userEmail: string, productId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, this.favoritesCollection),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      
      let favDocId: string;
      let currentFavorites: string[] = [];
      
      if (!snapshot.empty) {
        // Mevcut favoriler var
        const favDoc = snapshot.docs[0];
        favDocId = favDoc.id;
        const favData = favDoc.data() as UserFavorites;
        currentFavorites = favData.productIds || [];
      } else {
        // Yeni favori belgesi oluştur
        const newFavDoc = await addDoc(collection(db, this.favoritesCollection), {
          userId,
          userEmail,
          productIds: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        favDocId = newFavDoc.id;
      }

      // Ürünü ekle/çıkar
      const isCurrentlyFavorite = currentFavorites.includes(productId);
      let updatedFavorites: string[];
      
      if (isCurrentlyFavorite) {
        updatedFavorites = currentFavorites.filter(id => id !== productId);
      } else {
        updatedFavorites = [...currentFavorites, productId];
      }

      // Güncelle
      await updateDoc(doc(db, this.favoritesCollection, favDocId), {
        productIds: updatedFavorites,
        updatedAt: new Date().toISOString()
      });

      console.log(`${isCurrentlyFavorite ? '❤️ Favorilerden çıkarıldı' : '💖 Favorilere eklendi'}: ${productId}`);
      return !isCurrentlyFavorite; // Yeni durumu döndür
    } catch (error) {
      console.error('❌ Favori güncelleme hatası:', error);
      throw error;
    }
  }

  /**
   * Kullanıcının sepetini al
   */
  static async getUserCart(userId: string, userEmail: string): Promise<CartItem[]> {
    try {
      const q = query(
        collection(db, this.cartCollection),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const cartData = snapshot.docs[0].data() as UserCart;
        return cartData.items || [];
      }
      
      return [];
    } catch (error) {
      console.error('❌ Sepet alınırken hata:', error);
      return [];
    }
  }

  /**
   * Sepete ürün ekle
   */
  static async addToCart(userId: string, userEmail: string, productId: string, quantity: number = 1): Promise<void> {
    try {
      const q = query(
        collection(db, this.cartCollection),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      
      let cartDocId: string;
      let currentItems: CartItem[] = [];
      
      if (!snapshot.empty) {
        // Mevcut sepet var
        const cartDoc = snapshot.docs[0];
        cartDocId = cartDoc.id;
        const cartData = cartDoc.data() as UserCart;
        currentItems = cartData.items || [];
      } else {
        // Yeni sepet belgesi oluştur
        const newCartDoc = await addDoc(collection(db, this.cartCollection), {
          userId,
          userEmail,
          items: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        cartDocId = newCartDoc.id;
      }

      // Ürün zaten sepette var mı kontrol et
      const existingItemIndex = currentItems.findIndex(item => item.productId === productId);
      
      if (existingItemIndex !== -1) {
        // Mevcut ürünün miktarını artır
        currentItems[existingItemIndex].quantity += quantity;
      } else {
        // Yeni ürün ekle
        currentItems.push({
          productId,
          quantity,
          addedAt: new Date().toISOString()
        });
      }

      // Güncelle
      await updateDoc(doc(db, this.cartCollection, cartDocId), {
        items: currentItems,
        updatedAt: new Date().toISOString()
      });

      console.log(`🛒 Sepete eklendi: ${productId} (${quantity} adet)`);
    } catch (error) {
      console.error('❌ Sepete ekleme hatası:', error);
      throw error;
    }
  }

  /**
   * Sepetten ürün çıkar
   */
  static async removeFromCart(userId: string, userEmail: string, productId: string): Promise<void> {
    try {
      const q = query(
        collection(db, this.cartCollection),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const cartDoc = snapshot.docs[0];
        const cartData = cartDoc.data() as UserCart;
        const currentItems = cartData.items || [];
        
        // Ürünü çıkar
        const updatedItems = currentItems.filter(item => item.productId !== productId);
        
        await updateDoc(doc(db, this.cartCollection, cartDoc.id), {
          items: updatedItems,
          updatedAt: new Date().toISOString()
        });

        console.log(`🗑️ Sepetten çıkarıldı: ${productId}`);
      }
    } catch (error) {
      console.error('❌ Sepetten çıkarma hatası:', error);
      throw error;
    }
  }

  /**
   * Sepet miktarını güncelle
   */
  static async updateCartQuantity(userId: string, userEmail: string, productId: string, quantity: number): Promise<void> {
    try {
      if (quantity <= 0) {
        await this.removeFromCart(userId, userEmail, productId);
        return;
      }

      const q = query(
        collection(db, this.cartCollection),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const cartDoc = snapshot.docs[0];
        const cartData = cartDoc.data() as UserCart;
        const currentItems = cartData.items || [];
        
        // Ürünü bul ve miktarını güncelle
        const itemIndex = currentItems.findIndex(item => item.productId === productId);
        if (itemIndex !== -1) {
          currentItems[itemIndex].quantity = quantity;
          
          await updateDoc(doc(db, this.cartCollection, cartDoc.id), {
            items: currentItems,
            updatedAt: new Date().toISOString()
          });

          console.log(`📝 Sepet miktarı güncellendi: ${productId} = ${quantity}`);
        }
      }
    } catch (error) {
      console.error('❌ Sepet miktarı güncelleme hatası:', error);
      throw error;
    }
  }

  /**
   * Sepeti temizle
   */
  static async clearCart(userId: string, userEmail: string): Promise<void> {
    try {
      const q = query(
        collection(db, this.cartCollection),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const cartDoc = snapshot.docs[0];
        
        await updateDoc(doc(db, this.cartCollection, cartDoc.id), {
          items: [],
          updatedAt: new Date().toISOString()
        });

        console.log('🧹 Sepet temizlendi');
      }
    } catch (error) {
      console.error('❌ Sepet temizleme hatası:', error);
      throw error;
    }
  }

  /**
   * Sepetteki toplam ürün sayısını al
   */
  static async getCartItemCount(userId: string, userEmail: string): Promise<number> {
    try {
      const cartItems = await this.getUserCart(userId, userEmail);
      return cartItems.reduce((total, item) => total + item.quantity, 0);
    } catch (error) {
      console.error('❌ Sepet sayısı alma hatası:', error);
      return 0;
    }
  }
} 