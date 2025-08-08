import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, query, where, orderBy, limit, addDoc } from 'firebase/firestore';
import { Product, StockHistory, StockAnalytics, StockMovementData } from '../types';

export class StockService {
  private static stockCollection = 'stock_management';
  private static historyCollection = 'stock_history';

  /**
   * Ürün stoğunu güncelle
   */
  static async updateProductStock(
    productId: string, 
    quantity: number, 
    type: 'increase' | 'decrease' | 'sale' | 'adjustment',
    reason: string,
    adminEmail?: string,
    salePriceType?: 'site' | 'manual',
    manualSalePrice?: number
  ): Promise<void> {
    try {
      // Mevcut ürün bilgisini al
      const productDoc = await getDoc(doc(db, 'products', productId));
      if (!productDoc.exists()) {
        throw new Error('Ürün bulunamadı');
      }

      const product = productDoc.data() as Product;
      const previousStock = product.stockQuantity || 0;
      
      let newStock = previousStock;
      switch (type) {
        case 'increase':
          newStock = previousStock + quantity;
          break;
        case 'decrease':
        case 'sale':
          newStock = Math.max(0, previousStock - quantity);
          break;
        case 'adjustment':
          newStock = quantity;
          break;
      }

      // Ürün stok bilgisini güncelle
      await updateDoc(doc(db, 'products', productId), {
        stockQuantity: newStock,
        inStock: newStock > 0,
        lastStockUpdate: new Date().toISOString(),
        ...(type === 'sale' && { totalSold: (product.totalSold || 0) + quantity })
      });

      // Stok geçmişi kaydet
      const historyEntry: StockHistory = {
        id: `${productId}_${Date.now()}`,
        productId,
        date: new Date().toISOString(),
        type,
        quantity,
        previousStock,
        newStock,
        reason,
        adminEmail,
        // Satış işlemi için fiyat tipi ve manuel fiyatı kaydet
        ...(type === 'sale' && salePriceType ? { salePriceType } : {}),
        ...(type === 'sale' && salePriceType === 'manual' && manualSalePrice ? { manualSalePrice } : {})
      };

      await addDoc(collection(db, this.historyCollection), historyEntry);

      console.log(`✅ Stok güncellendi: ${product.name} - ${previousStock} → ${newStock}`);
    } catch (error) {
      console.error('❌ Stok güncelleme hatası:', error);
      throw error;
    }
  }

  /**
   * Ürünün stok geçmişini al
   */
  static async getProductStockHistory(productId: string): Promise<StockHistory[]> {
    try {
      const q = query(
        collection(db, this.historyCollection),
        where('productId', '==', productId),
        orderBy('date', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as StockHistory);
    } catch (error) {
      console.error('❌ Stok geçmişi alma hatası:', error);
      return [];
    }
  }

  /**
   * Stok analitiklerini al
   */
  static async getStockAnalytics(): Promise<StockAnalytics> {
    try {
      // Tüm ürünleri al
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const products = productsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Product[];

      // Temel istatistikler
      const totalProducts = products.length;
      const inStockProducts = products.filter(p => (p.stockQuantity || 0) > 0).length;
      const outOfStockProducts = products.filter(p => (p.stockQuantity || 0) === 0).length;
      const lowStockProducts = products.filter(p => 
        (p.stockQuantity || 0) > 0 && 
        (p.stockQuantity || 0) <= (p.minStockLevel || 5)
      ).length;

      // Toplam stok değeri
      const totalStockValue = products.reduce((sum, product) => {
        return sum + ((product.stockQuantity || 0) * product.price);
      }, 0);

      // Ortalama stok seviyesi
      const averageStockLevel = products.length > 0 
        ? products.reduce((sum, p) => sum + (p.stockQuantity || 0), 0) / products.length
        : 0;

      // En çok satılan ürünler (totalSold'a göre)
      const topSellingProducts = products
        .filter(p => p.totalSold && p.totalSold > 0)
        .sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0))
        .slice(0, 10);

      // Son stok değişiklikleri
      const recentHistoryQuery = query(
        collection(db, this.historyCollection),
        orderBy('date', 'desc'),
        limit(20)
      );
      const historySnapshot = await getDocs(recentHistoryQuery);
      const recentStockChanges = historySnapshot.docs.map(doc => doc.data() as StockHistory);

      // Aylık stok hareketi (son 6 ay)
      const monthlyStockMovement = await this.getMonthlyStockMovement();

      return {
        totalProducts,
        inStockProducts,
        outOfStockProducts,
        lowStockProducts,
        totalStockValue,
        averageStockLevel,
        topSellingProducts,
        recentStockChanges,
        monthlyStockMovement
      };
    } catch (error) {
      console.error('❌ Stok analitikleri alma hatası:', error);
      throw error;
    }
  }

  /**
   * Aylık stok hareketini al
   */
  private static async getMonthlyStockMovement(): Promise<StockMovementData[]> {
    try {
      const months = [];
      const now = new Date();
      
      // Son 6 ay
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString();
        
        const q = query(
          collection(db, this.historyCollection),
          where('date', '>=', monthStart),
          where('date', '<=', monthEnd)
        );
        
        const snapshot = await getDocs(q);
        const movements = snapshot.docs.map(doc => doc.data() as StockHistory);
        
        const stockIn = movements
          .filter(m => m.type === 'increase')
          .reduce((sum, m) => sum + m.quantity, 0);
          
        const stockOut = movements
          .filter(m => m.type === 'decrease')
          .reduce((sum, m) => sum + m.quantity, 0);
          
        const sales = movements
          .filter(m => m.type === 'sale')
          .reduce((sum, m) => sum + m.quantity, 0);

        months.push({
          month: date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'short' }),
          stockIn,
          stockOut,
          sales
        });
      }
      
      return months;
    } catch (error) {
      console.error('❌ Aylık stok hareketi alma hatası:', error);
      return [];
    }
  }

  /**
   * Düşük stok uyarısı
   */
  static async getLowStockProducts(): Promise<Product[]> {
    try {
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const products = productsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Product[];

      return products.filter(product => {
        const stock = product.stockQuantity || 0;
        const minLevel = product.minStockLevel || 5;
        return stock > 0 && stock <= minLevel;
      });
    } catch (error) {
      console.error('❌ Düşük stok ürünleri alma hatası:', error);
      return [];
    }
  }

  /**
   * Stok seviyelerini toplu güncelle
   */
  static async bulkUpdateStockLevels(updates: Array<{
    productId: string;
    minStockLevel: number;
    maxStockLevel: number;
  }>): Promise<void> {
    try {
      const promises = updates.map(update => 
        updateDoc(doc(db, 'products', update.productId), {
          minStockLevel: update.minStockLevel,
          maxStockLevel: update.maxStockLevel
        })
      );
      
      await Promise.all(promises);
      console.log('✅ Stok seviyeleri toplu güncellendi');
    } catch (error) {
      console.error('❌ Toplu stok güncelleme hatası:', error);
      throw error;
    }
  }

  /**
   * Otomatik stok uyarıları
   */
  static async getStockAlerts(): Promise<{
    lowStock: Product[];
    outOfStock: Product[];
    highStock: Product[];
  }> {
    try {
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const products = productsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Product[];

      const lowStock = products.filter(p => {
        const stock = p.stockQuantity || 0;
        const minLevel = p.minStockLevel || 5;
        return stock > 0 && stock <= minLevel;
      });

      const outOfStock = products.filter(p => (p.stockQuantity || 0) === 0);

      const highStock = products.filter(p => {
        const stock = p.stockQuantity || 0;
        const maxLevel = p.maxStockLevel || 100;
        return stock >= maxLevel;
      });

      return { lowStock, outOfStock, highStock };
    } catch (error) {
      console.error('❌ Stok uyarıları alma hatası:', error);
      return { lowStock: [], outOfStock: [], highStock: [] };
    }
  }
} 