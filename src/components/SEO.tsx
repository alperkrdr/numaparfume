import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  schema?: object;
}

const SEO: React.FC<SEOProps> = ({
  title = "Numa Parfume - Benzersiz Benzerlik | Premium Parfüm Koleksiyonu",
  description = "Numa Parfume ile benzersiz benzerlik deneyimi yaşayın. Kadın, erkek ve unisex parfüm koleksiyonlarımızı keşfedin. AI parfüm danışmanı ile size özel öneriler alın.",
  keywords = "parfüm, kadın parfümü, erkek parfümü, unisex parfüm, İstanbul parfüm, online parfüm satış, kaliteli parfüm, benzersiz parfüm, parfüm önerileri, AI parfüm danışmanı",
  image = "https://numaparfume.com/cb41ce71-b8c6-4741-91ba-5a88fca6de7b.jpeg",
  url = "https://numaparfume.com",
  type = "website",
  author = "Numa Parfume",
  publishedTime,
  modifiedTime,
  schema
}) => {
  const siteName = "Numa Parfume";
  const defaultKeywords = "parfüm, kadın parfümü, erkek parfümü, unisex parfüm, İstanbul parfüm, online parfüm satış, kaliteli parfüm, benzersiz parfüm, parfüm önerileri, AI parfüm danışmanı";
  const finalKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="tr_TR" />
      
      {/* Article specific */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#C9A876" />
      <meta name="msapplication-TileColor" content="#C9A876" />
      <meta name="application-name" content={siteName} />
      <meta name="msapplication-tooltip" content={description} />
      
      {/* Schema.org Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO; 