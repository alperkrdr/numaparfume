import { useState, useEffect, useCallback, useMemo } from 'react';
import { Product } from '../types';
import { ProductService } from '../services/productService';

// Cache sistem
const CACHE_KEY = 'numa-products-cache';
const CACHE_EXPIRY = 10 * 60 * 1000; // 10 dakika

interface ProductCache {
  products: Product[];
  timestamp: number;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cache'den veri yükle
  const loadFromCache = useCallback((): Product[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsedCache: ProductCache = JSON.parse(cached);
        const now = Date.now();
        
        // Cache geçerli mi kontrol et
        if (now - parsedCache.timestamp < CACHE_EXPIRY) {
          console.log('🎯 Ürünler cache\'den yüklendi');
          return parsedCache.products;
        } else {
          // Eski cache'i temizle
          localStorage.removeItem(CACHE_KEY);
        }
      }
    } catch (error) {
      console.error('Cache load error:', error);
      localStorage.removeItem(CACHE_KEY);
    }
    return null;
  }, []);

  // Cache'e veri kaydet
  const saveToCache = useCallback((products: Product[]) => {
    try {
      const cacheData: ProductCache = {
        products,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log('💾 Ürünler cache\'e kaydedildi');
    } catch (error) {
      console.error('Cache save error:', error);
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setError(null);
        
        // Önce cache'den yükle
        const cachedProducts = loadFromCache();
        if (cachedProducts) {
          setProducts(cachedProducts);
          setLoading(false);
          return;
        }
        
        setLoading(true);
        console.log('🔄 Firebase\'den ürünler yükleniyor...');
        
        // Firebase'den ürünleri getir
        const firebaseProducts = await ProductService.getAllProducts();
        
        if (firebaseProducts.length > 0) {
        setProducts(firebaseProducts);
          saveToCache(firebaseProducts);
          console.log(`✅ ${firebaseProducts.length} ürün yüklendi`);
        } else {
          throw new Error('Ürün bulunamadı');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        
        // Hata durumunda örnek ürünleri kullan
        const sampleProducts = ProductService.getSampleProducts();
        setProducts(sampleProducts);
        setError('Firebase bağlantısı kurulamadı, örnek ürünler gösteriliyor');
        console.log('🔄 Örnek ürünler yüklendi');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [loadFromCache, saveToCache]);

  // Memoized kategoriye göre ürün filtreleme
  const getProductsByCategory = useCallback((category: string) => {
    return products.filter(product => product.category === category);
  }, [products]);

  // Memoized öne çıkan ürünler
  const getFeaturedProducts = useCallback(() => {
    return products.filter(product => product.featured);
  }, [products]);

  // Memoized koleksiyon ürünleri
  const getCollectionProducts = useCallback(() => {
    return products.filter(product => product.collection);
  }, [products]);

  // Memoized arama fonksiyonu
  const searchProducts = useCallback((query: string) => {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return products;
    
    return products.filter(product => 
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.originalName.toLowerCase().includes(normalizedQuery) ||
      product.description.toLowerCase().includes(normalizedQuery) ||
      product.brand.toLowerCase().includes(normalizedQuery) ||
      product.originalBrand.toLowerCase().includes(normalizedQuery) ||
      product.category.toLowerCase().includes(normalizedQuery) ||
      product.seoKeywords?.some(keyword => 
        keyword.toLowerCase().includes(normalizedQuery)
      )
    );
  }, [products]);

  // Kategorilerin sayısını memoize et
  const categoryStats = useMemo(() => {
    const stats = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      ...stats,
      total: products.length,
      featured: products.filter(p => p.featured).length,
      inStock: products.filter(p => p.inStock).length
    };
  }, [products]);

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newProductId = await ProductService.addProduct(productData);
      const updatedProducts = await ProductService.getAllProducts();
      setProducts(updatedProducts);
      return newProductId;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      await ProductService.updateProduct(id, productData);
      const updatedProducts = await ProductService.getAllProducts();
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await ProductService.deleteProduct(id);
      const updatedProducts = await ProductService.getAllProducts();
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const refreshProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cache'i temizle
      localStorage.removeItem(CACHE_KEY);
      console.log('🔄 Cache temizlendi, yeni veriler getiriliyor...');
      
      const firebaseProducts = await ProductService.getAllProducts();
      
      if (firebaseProducts.length > 0) {
      setProducts(firebaseProducts);
        saveToCache(firebaseProducts);
        console.log(`✅ ${firebaseProducts.length} ürün yenilendi`);
      } else {
        throw new Error('Ürün bulunamadı');
      }
    } catch (err) {
      console.error('Error refreshing products:', err);
      
      // Hata durumunda örnek ürünleri kullan
      const sampleProducts = ProductService.getSampleProducts();
      setProducts(sampleProducts);
      setError('Firebase bağlantısı kurulamadı, örnek ürünler gösteriliyor');
      console.log('🔄 Örnek ürünler yenilendi');
    } finally {
      setLoading(false);
    }
  }, [saveToCache]);

  return {
    products,
    loading,
    error,
    categoryStats,
    getProductsByCategory,
    getFeaturedProducts,
    getCollectionProducts,
    searchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts
  };
};