import React, { useState, useCallback, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
  loading?: 'lazy' | 'eager';
  quality?: number;
  width?: number;
  height?: number;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDIwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTA1Vjc1SDE1MFYxMDVIMTAwWk05NSA3MEg5MFY2NUgxMTBWNzBIMTA1VjEwNUgxMDBWMTEwSDkwVjEwNUg5NVY3MFpNMTU1IDY1SDE1MFY3MEgxNTVWNjVaTTE1NSA2MEgxNjBWNjVIMTU1VjYwWk0xNjAgNTVIMTY1VjYwSDE2MFY1NVpNMTY1IDEyMFYxMTVIMTYwVjEyMEgxNjVaTTE2NSAxMjVIMTYwVjEzMEgxNjVWMTI1Wk0xNjAgMTM1SDE1NVYxMzBIMTYwVjEzNVpNMTU1IDE0MEgxNTBWMTM1SDE1NVYxNDBaTTE1MCA5NUgxNTVWMTAwSDE1MFY5NVpNMTU1IDkwSDE2MFY5NUgxNTVWOTBaTTE2MCA4NUgxNjVWOTBIMTYwVjg1Wk0xNjUgODBIMTcwVjg1SDE2NVY4MFpNMTcwIDc1SDE3NVY4MEgxNzBWNzVaTTE3NSA3MEgxODBWNzVIMTc1VjcwWiIgZmlsbD0iIzlDQTNBRiIvPgo8dGV4dCB4PSI1MCIgeT0iMTgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2QjcyODAiPtCf0LDRgNGE0Y48L3RleHQ+Cjwvc3ZnPg==',
  onLoad,
  onError,
  loading = 'lazy',
  quality = 75,
  width,
  height
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(loading === 'eager');
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (loading === 'eager') {
      setIsInView(true);
      return;
    }

    if (!imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before the image comes into view
        threshold: 0.1
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [loading]);

  // Load image when in view
  useEffect(() => {
    if (isInView && src && !imageSrc) {
      setImageSrc(src);
    }
  }, [isInView, src, imageSrc]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
    }
    onError?.();
  }, [fallbackSrc, imageSrc, onError]);

  // Create optimized image URL (if needed - this is a placeholder for future CDN integration)
  const getOptimizedUrl = useCallback((url: string) => {
    // Future: Add image optimization service URL transformation here
    // For now, return the original URL
    return url;
  }, []);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      )}

      {/* Actual image */}
      <img
        ref={imgRef}
        src={imageSrc || ''}
        alt={alt}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          aspectRatio: width && height ? `${width}/${height}` : undefined
        }}
      />

      {/* Error state */}
      {hasError && imageSrc === fallbackSrc && (
        <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center text-gray-400">
          <div className="w-8 h-8 mb-2">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-xs">Görsel yüklenemedi</span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage; 