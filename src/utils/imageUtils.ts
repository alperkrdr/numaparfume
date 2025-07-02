// Image compression ve resize utilities

interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeKB?: number;
}

export class ImageUtils {
  /**
   * Base64 string'ini compress eder
   */
  static async compressBase64Image(
    base64String: string,
    options: CompressOptions = {}
  ): Promise<string> {
    const {
      maxWidth = 800,
      maxHeight = 600,
      quality = 0.8,
      maxSizeKB = 800 // 800KB = ~1MB'ın altında kalır
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          // Canvas oluştur
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Canvas context oluşturulamadı'));
            return;
          }

          // Orijinal boyutları al
          let { width, height } = img;

          // Aspect ratio koruyarak yeniden boyutlandır
          if (width > maxWidth || height > maxHeight) {
            const aspectRatio = width / height;
            
            if (width > height) {
              width = maxWidth;
              height = width / aspectRatio;
            } else {
              height = maxHeight;
              width = height * aspectRatio;
            }
          }

          // Canvas boyutlarını ayarla
          canvas.width = width;
          canvas.height = height;

          // Image'i canvas'a çiz
          ctx.drawImage(img, 0, 0, width, height);

          // Compress edilmiş base64 al
          let compressedBase64 = canvas.toDataURL('image/jpeg', quality);

          // Boyut kontrolü yap
          const sizeKB = this.getBase64SizeKB(compressedBase64);
          
          // Eğer hala büyükse quality'yi azalt
          if (sizeKB > maxSizeKB && quality > 0.1) {
            const newQuality = Math.max(0.1, quality * 0.8);
            compressedBase64 = canvas.toDataURL('image/jpeg', newQuality);
          }

          console.log(`🖼️ Image compressed: ${sizeKB}KB (quality: ${quality})`);
          resolve(compressedBase64);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Image yüklenemedi'));
      };

      // Base64 string'ini image'e yükle
      img.src = base64String;
    });
  }

  /**
   * File'ı base64'e çevirir ve compress eder
   */
  static async fileToCompressedBase64(
    file: File,
    options?: CompressOptions
  ): Promise<string> {
    // Önce file'ı base64'e çevir
    const base64 = await this.fileToBase64(file);
    
    // Sonra compress et
    return this.compressBase64Image(base64, options);
  }

  /**
   * File'ı base64 string'ine çevirir
   */
  static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        resolve(reader.result as string);
      };
      
      reader.onerror = () => {
        reject(new Error('File okuma hatası'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  /**
   * Base64 string'inin boyutunu KB cinsinden hesaplar
   */
  static getBase64SizeKB(base64String: string): number {
    // Base64 overhead'ini hesaba kat (yaklaşık %33)
    const base64Data = base64String.split(',')[1] || base64String;
    const bytes = (base64Data.length * 3) / 4;
    return Math.round(bytes / 1024);
  }

  /**
   * Image boyutlarını alır
   */
  static getImageDimensions(base64String: string): Promise<{width: number, height: number}> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
      
      img.onerror = () => {
        reject(new Error('Image boyutları alınamadı'));
      };
      
      img.src = base64String;
    });
  }

  /**
   * File tipinin desteklenip desteklenmediğini kontrol eder
   */
  static isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    return validTypes.includes(file.type);
  }

  /**
   * File boyutunu kontrol eder
   */
  static isValidFileSize(file: File, maxSizeMB: number = 5): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  /**
   * Image validate eder
   */
  static validateImageFile(file: File): {isValid: boolean, error?: string} {
    if (!this.isValidImageFile(file)) {
      return {
        isValid: false,
        error: 'Sadece JPEG, PNG ve WebP formatları destekleniyor'
      };
    }

    if (!this.isValidFileSize(file)) {
      return {
        isValid: false,
        error: 'Dosya boyutu 5MB\'dan büyük olamaz'
      };
    }

    return { isValid: true };
  }
} 