export interface Product {
  id: string;
  name: string;
  originalName: string; // Orijinal parfüm adı (SEO için, gizli)
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: 'kadın' | 'erkek' | 'unisex';
  brand: string;
  originalBrand: string; // Orijinal marka adı (SEO için, gizli)
  size: string;
  inStock: boolean;
  featured: boolean;
  collection?: boolean; // Koleksiyonu Keşfet kısmında gösterilecek mi?
  shopierLink: string;
  notes?: {
    top?: string[];
    middle?: string[];
    base?: string[];
  };
  seoKeywords?: string[]; // SEO anahtar kelimeleri
  createdAt: Date;
  updatedAt: Date;
  stockQuantity: number;      // Mevcut stok adedi
  minStockLevel: number;      // Minimum stok seviyesi (uyarı için)
  maxStockLevel: number;      // Maksimum stok seviyesi
  totalSold: number;          // Toplam satış adedi
  lastStockUpdate: string;    // Son stok güncelleme tarihi
  stockHistory: StockHistory[]; // Stok geçmişi
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  displayName?: string;
}

export interface SiteSettings {
  id: string;
  siteName: string;
  siteSlogan: string;
  siteDescription: string;
  heroImage?: string;
  logoImage?: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  socialMedia: {
    instagram: string;
    facebook: string;
    twitter: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  geminiSettings: {
    apiKey: string;
    isActive: boolean;
    dailyPostTime: string;
    lastPostDate?: Date;
  };
  campaignSettings: {
    isActive: boolean;
    title: string;
    description: string;
    minAmount: number; // Minimum alım tutarı
    discountType: 'percentage' | 'fixed'; // Yüzde veya sabit tutar
    discountValue: number; // İndirim değeri
    startDate?: Date;
    endDate?: Date;
  };
  updatedAt: Date;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  productIds: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ForumPost {
  id: string;
  authorId?: string; // AI-üretimi için boş olabilir
  authorName?: string; // AI-üretimi için boş olabilir
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  image?: string;
  tags: string[];
  isPublished: boolean;
  isGenerated: boolean; // AI tarafından oluşturuldu mu?
  seoKeywords: string[];
  metaDescription: string;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  imageUrl?: string; // Makale için görsel URL'si
}

export interface AIRecommendationData {
  userId?: string;
  preferences: {
    gender: 'kadın' | 'erkek' | 'unisex' | '';
    age: string;
    occasion: string;
    season: string;
    intensity: string;
    budget: string;
    favoriteNotes: string[];
  };
  recommendations: string[]; // Product IDs
  createdAt: Date;
}

export interface StockHistory {
  id: string;
  productId: string;
  date: string;
  type: 'increase' | 'decrease' | 'sale' | 'adjustment';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  adminEmail?: string;
}

export interface StockAnalytics {
  totalProducts: number;
  inStockProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  totalStockValue: number;
  averageStockLevel: number;
  topSellingProducts: Product[];
  recentStockChanges: StockHistory[];
  monthlyStockMovement: StockMovementData[];
}

export interface StockMovementData {
  month: string;
  stockIn: number;
  stockOut: number;
  sales: number;
}

export interface UserFavorites {
  id: string;
  userId: string;
  userEmail: string;
  productIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserCart {
  id: string;
  userId: string;
  userEmail: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: string;
}