import { Helmet } from 'react-helmet-async';
import { Product } from '../types';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  product?: Product;
  structuredData?: object;
}

export default function SEO({
  title = "Numa Parfume - Premium Parfüm ve Koku Koleksiyonu | Benzersiz Benzerlik",
  description = "Numa Parfume ile eşsiz parfüm deneyimi yaşayın. Premium kalite parfümler, doğal esanslar ve benzersiz koku koleksiyonuyla kendinizi özel hissedin. Ücretsiz kargo, hızlı teslimat.",
  keywords = "parfüm, koku, esans, parfüm mağazası, premium parfüm, doğal parfüm, kadın parfümü, erkek parfümü, unisex parfüm, parfüm satış, online parfüm, türkiye parfüm",
  image = "https://numaparfume.com/cb41ce71-b8c6-4741-91ba-5a88fca6de7b.jpeg",
  url = "https://numaparfume.com",
  type = 'website',
  product,
  structuredData
}: SEOProps) {
  
  // Product sayfası için özel meta veriler
  const getProductMeta = () => {
    if (!product) return {};
    
    return {
      title: `${product.name} - ${product.brand} | Numa Parfume`,
      description: `${product.name} parfümünü ${product.price}₺ özel fiyatıyla satın alın. ${product.description || ''} Ücretsiz kargo ve hızlı teslimat.`,
      keywords: `${product.name}, ${product.brand}, ${product.category}, parfüm, ${keywords}`,
             image: product.image || image,
      url: `${url}/product/${product.id}`
    };
  };

  const meta = product ? getProductMeta() : { title, description, keywords, image, url };

  // Structured Data - Ürün için
  const productStructuredData = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description || meta.description,
         "image": product.image || image,
    "brand": {
      "@type": "Brand",
      "name": product.brand
    },
    "category": product.category,
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "TRY",
      "availability": product.stockQuantity && product.stockQuantity > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "url": meta.url,
      "seller": {
        "@type": "Organization",
        "name": "Numa Parfume"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.7",
      "reviewCount": "25"
    }
  } : null;

  const finalStructuredData = structuredData || productStructuredData;

  return (
    <Helmet>
      {/* Title ve Basic Meta */}
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="keywords" content={meta.keywords} />
      <link rel="canonical" href={meta.url} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={meta.image} />
      <meta property="og:url" content={meta.url} />
      <meta property="og:site_name" content="Numa Parfume" />
      <meta property="og:locale" content="tr_TR" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={meta.image} />
      
      {/* Mobil Optimizasyon */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Numa Parfume" />
      
      {/* Performance ve Güvenlik */}
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="referrer" content="origin-when-cross-origin" />
      
      {/* Arama Motoru Direktifleri */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      
      {/* Structured Data */}
      {finalStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(finalStructuredData)}
        </script>
      )}
      
      {/* Preload kritik kaynaklar */}
      <link rel="preload" href="/cb41ce71-b8c6-4741-91ba-5a88fca6de7b.jpeg" as="image" />
      <link rel="preload" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" as="style" />
    </Helmet>
  );
} 