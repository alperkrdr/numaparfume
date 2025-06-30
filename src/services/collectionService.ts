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
import { Collection } from '../types';

const COLLECTION_NAME = 'collections';

export class CollectionService {
  // Tüm koleksiyonları getir
  static async getAllCollections(): Promise<Collection[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Collection[];
    } catch (error) {
      console.error('Error fetching collections:', error);
      throw new Error('Koleksiyonlar yüklenirken hata oluştu');
    }
  }

  // Aktif koleksiyonları getir
  static async getActiveCollections(): Promise<Collection[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Collection[];
    } catch (error) {
      console.error('Error fetching active collections:', error);
      throw new Error('Aktif koleksiyonlar yüklenirken hata oluştu');
    }
  }

  // Yeni koleksiyon ekle
  static async addCollection(collectionData: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...collectionData,
        createdAt: now,
        updatedAt: now,
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding collection:', error);
      throw new Error('Koleksiyon eklenirken hata oluştu');
    }
  }

  // Koleksiyon güncelle
  static async updateCollection(id: string, collectionData: Partial<Collection>): Promise<void> {
    try {
      const collectionRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(collectionRef, {
        ...collectionData,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating collection:', error);
      throw new Error('Koleksiyon güncellenirken hata oluştu');
    }
  }

  // Koleksiyon sil
  static async deleteCollection(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting collection:', error);
      throw new Error('Koleksiyon silinirken hata oluştu');
    }
  }
}