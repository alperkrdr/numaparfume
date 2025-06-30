import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';

const COLLECTION_NAME = 'products';

// Örnek ürünler (Firebase bağlantısı olmadığında kullanılacak)
const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'sample-1',
    name: 'Chanel No. 5 Benzeri',
    originalName: 'Chanel No. 5',
    description: 'Klasik ve zamansız bir parfüm. Çiçeksi notalarla zenginleştirilmiş bu eşsiz koku, her anınızı özel kılar.',
    price: 299,
    originalPrice: 399,
    image: 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg',
    images: [
      'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg',
      'https://images.pexels.com/photos/1190829/pexels-photo-1190829.jpeg'
    ],
    category: 'kadın' as const,
    brand: 'Numa Parfume',
    originalBrand: 'Chanel',
    size: '50ml',
    inStock: true,
    featured: true,
    shopierLink: 'https://shopier.com/sample-product-1',
    notes: {
      top: ['Bergamot', 'Limon', 'Neroli'],
      middle: ['Gül', 'Yasemin', 'Zambak'],
      base: ['Sandal Ağacı', 'Vanilya', 'Misk']
    },
    seoKeywords: ['chanel no 5', 'klasik parfüm', 'kadın parfümü', 'çiçeksi parfüm'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'sample-2',
    name: 'Dior Sauvage Benzeri',
    originalName: 'Dior Sauvage',
    description: 'Güçlü ve maskülen bir koku. Taze ve odunsu notalarla erkeklerin favorisi.',
    price: 349,
    image: 'https://images.pexels.com/photos/1190829/pexels-photo-1190829.jpeg',
    category: 'erkek' as const,
    brand: 'Numa Parfume',
    originalBrand: 'Dior',
    size: '100ml',
    inStock: true,
    featured: true,
    shopierLink: 'https://shopier.com/sample-product-2',
    notes: {
      top: ['Bergamot', 'Karabiber'],
      middle: ['Lavanta', 'Elemi'],
      base: ['Ambroxan', 'Vetiver']
    },
    seoKeywords: ['dior sauvage', 'erkek parfümü', 'maskülen parfüm', 'odunsu parfüm'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'sample-3',
    name: 'Tom Ford Black Orchid Benzeri',
    originalName: 'Tom Ford Black Orchid',
    description: 'Lüks ve sofistike bir unisex parfüm. Gizemli ve büyüleyici notalarla.',
    price: 449,
    originalPrice: 599,
    image: 'https://images.pexels.com/photos/1961795/pexels-photo-1961795.jpeg',
    category: 'unisex' as const,
    brand: 'Numa Parfume',
    originalBrand: 'Tom Ford',
    size: '75ml',
    inStock: true,
    featured: false,
    shopierLink: 'https://shopier.com/sample-product-3',
    notes: {
      top: ['Truffle', 'Bergamot', 'Blackcurrant'],
      middle: ['Orchid', 'Spices', 'Fruity Notes'],
      base: ['Patchouli', 'Vanilla', 'Incense']
    },
    seoKeywords: ['tom ford black orchid', 'unisex parfüm', 'lüks parfüm', 'gizemli parfüm'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export class ProductService {
  // Tüm ürünleri getir
  static async getAllProducts(): Promise<Product[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Product[];

      // Eğer hiç ürün yoksa, örnek ürünleri döndür
      if (products.length === 0) {
        console.warn('No products found in Firebase, using sample products');
        return SAMPLE_PRODUCTS;
      }

      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      
      // Firebase bağlantı hatası durumunda örnek ürünleri döndür
      console.warn('Using sample products due to Firebase connection error');
      return SAMPLE_PRODUCTS;
    }
  }

  // Kategoriye göre ürünleri getir
  static async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Product[];

      // Eğer hiç ürün yoksa, örnek ürünlerden filtrele
      if (products.length === 0) {
        console.warn(`No products found for category ${category}, using sample products`);
        return SAMPLE_PRODUCTS.filter(product => product.category === category);
      }

      return products;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      
      // Firebase bağlantı hatası durumunda örnek ürünlerden filtrele
      return SAMPLE_PRODUCTS.filter(product => product.category === category);
    }
  }

  // Öne çıkan ürünleri getir
  static async getFeaturedProducts(): Promise<Product[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('featured', '==', true),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Product[];

      // Eğer hiç öne çıkan ürün yoksa, örnek ürünlerden filtrele
      if (products.length === 0) {
        console.warn('No featured products found, using sample products');
        return SAMPLE_PRODUCTS.filter(product => product.featured);
      }

      return products;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      
      // Firebase bağlantı hatası durumunda örnek ürünlerden filtrele
      return SAMPLE_PRODUCTS.filter(product => product.featured);
    }
  }

  // Yeni ürün ekle
  static async addProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...productData,
        createdAt: now,
        updatedAt: now,
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding product:', error);
      throw new Error('Ürün eklenirken hata oluştu');
    }
  }

  // Ürün güncelle
  static async updateProduct(id: string, productData: Partial<Product>): Promise<void> {
    try {
      const productRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(productRef, {
        ...productData,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Ürün güncellenirken hata oluştu');
    }
  }

  // Ürün sil
  static async deleteProduct(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Ürün silinirken hata oluştu');
    }
  }

  // Ürün ara (hem görünen ad hem de orijinal adda)
  static async searchProducts(searchTerm: string): Promise<Product[]> {
    try {
      // Önce tüm ürünleri al
      const allProducts = await this.getAllProducts();
      
      return allProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.originalBrand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.seoKeywords?.some(keyword => 
          keyword.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } catch (error) {
      console.error('Error searching products:', error);
      
      // Hata durumunda örnek ürünlerden ara
      return SAMPLE_PRODUCTS.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.originalBrand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.seoKeywords?.some(keyword => 
          keyword.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }

  // AI önerileri için ürün filtrele
  static async getProductsForAI(filters: {
    category?: string;
    priceRange?: [number, number];
    notes?: string[];
    inStock?: boolean;
  }): Promise<Product[]> {
    try {
      let products = await this.getAllProducts();

      // Filtreleri uygula
      if (filters.category && filters.category !== 'unisex') {
        products = products.filter(p => 
          p.category === filters.category || p.category === 'unisex'
        );
      }

      if (filters.priceRange) {
        const [min, max] = filters.priceRange;
        products = products.filter(p => p.price >= min && p.price <= max);
      }

      if (filters.inStock !== undefined) {
        products = products.filter(p => p.inStock === filters.inStock);
      }

      if (filters.notes && filters.notes.length > 0) {
        products = products.filter(product => {
          if (!product.notes) return false;
          
          const allNotes = [
            ...(product.notes.top || []),
            ...(product.notes.middle || []),
            ...(product.notes.base || [])
          ];
          
          return filters.notes!.some(filterNote =>
            allNotes.some(productNote => 
              productNote.toLowerCase().includes(filterNote.toLowerCase()) ||
              filterNote.toLowerCase().includes(productNote.toLowerCase())
            )
          );
        });
      }

      return products;
    } catch (error) {
      console.error('Error getting products for AI:', error);
      return [];
    }
  }

  // Örnek ürünleri döndür (Firebase bağlantısı olmadığında)
  static getSampleProducts(): Product[] {
    return SAMPLE_PRODUCTS;
  }
}