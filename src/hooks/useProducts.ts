import { useState, useEffect } from 'react';
import { Product } from '../types';
import { ProductService } from '../services/productService';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Firebase'den ürünleri getir (hata durumunda örnek ürünler döner)
        const firebaseProducts = await ProductService.getAllProducts();
        setProducts(firebaseProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        
        // Hata durumunda örnek ürünleri kullan
        const sampleProducts = ProductService.getSampleProducts();
        setProducts(sampleProducts);
        setError('Firebase bağlantısı kurulamadı, örnek ürünler gösteriliyor');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getProductsByCategory = (category: string) => {
    return products.filter(product => product.category === category);
  };

  const getFeaturedProducts = () => {
    return products.filter(product => product.featured);
  };

  const searchProducts = (query: string) => {
    return products.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.originalName.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase()) ||
      product.brand.toLowerCase().includes(query.toLowerCase()) ||
      product.originalBrand.toLowerCase().includes(query.toLowerCase()) ||
      product.seoKeywords?.some(keyword => 
        keyword.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

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

  const refreshProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const firebaseProducts = await ProductService.getAllProducts();
      setProducts(firebaseProducts);
    } catch (err) {
      console.error('Error refreshing products:', err);
      
      // Hata durumunda örnek ürünleri kullan
      const sampleProducts = ProductService.getSampleProducts();
      setProducts(sampleProducts);
      setError('Firebase bağlantısı kurulamadı, örnek ürünler gösteriliyor');
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    loading,
    error,
    getProductsByCategory,
    getFeaturedProducts,
    searchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts
  };
};