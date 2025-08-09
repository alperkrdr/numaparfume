// Admin konfigürasyon ayarları
export const AdminConfig = {
  // Buraya Firebase'den oluşturduğunuz admin e-posta adreslerini ekleyin
  adminEmails: [
    'admin@numaparfume.com',      // Varsayılan admin
    'numa@admin.com',             // Alternatif admin
    'admin@email.com',            // Firebase'den oluşturulan admin e-posta
    'test@admin.com',             // Test admin e-posta
    'admin@test.com',             // Test admin e-posta 2
    'test@test.com',              // Test admin e-posta 3
  ],
  
  // Admin panel ayarları
  settings: {
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 saat (milisaniye)
    autoLogout: true,
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 dakika
  },
  
  // Admin yetkiler
  permissions: {
    canManageProducts: true,
    canManageUsers: true,
    canManageSettings: true,
    canAccessForum: true,
    canGenerateContent: true,
  }
};

// Admin e-posta kontrolü
export const isAdminEmail = (email: string): boolean => {
  return AdminConfig.adminEmails.includes(email.toLowerCase());
};

// Admin yetki kontrolü
export const hasPermission = (permission: keyof typeof AdminConfig.permissions): boolean => {
  return AdminConfig.permissions[permission];
}; 