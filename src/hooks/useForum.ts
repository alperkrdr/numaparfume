import { useState, useEffect, useCallback } from 'react';
import { ForumPost } from '../types';
import { ForumService } from '../services/forumService';

export const useForum = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allPosts = await ForumService.getAllPostsForAdmin();
      setPosts(allPosts);
    } catch (e) {
      console.error("Error fetching forum posts:", e);
      setError("Makaleler yüklenirken bir hata oluştu.");
      // Fallback: localStorage'dan yükle
      try {
        const mockPosts = JSON.parse(localStorage.getItem('mock_forum_posts') || '[]');
        setPosts(mockPosts.map((p: any) => ({...p, createdAt: new Date(p.createdAt)})));
        setError("Makaleler yüklenemedi, lokaldeki veriler gösteriliyor.");
      } catch (localError) {
        console.error("Error loading mock posts:", localError);
        setPosts([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const addPost = useCallback(async (postData: Omit<ForumPost, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'>) => {
    setLoading(true);
    try {
      await ForumService.addPost(postData);
      await fetchPosts(); // Listeyi yenile
    } catch (e) {
      console.error("Error adding post:", e);
      setError("Makale eklenirken bir hata oluştu.");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [fetchPosts]);

  const updatePost = useCallback(async (id: string, postData: Partial<ForumPost>) => {
    setLoading(true);
    try {
      await ForumService.updatePost(id, postData);
      await fetchPosts(); // Listeyi yenile
    } catch (e) {
      console.error("Error updating post:", e);
      setError("Makale güncellenirken bir hata oluştu.");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [fetchPosts]);

  const deletePost = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await ForumService.deletePost(id);
      await fetchPosts(); // Listeyi yenile
    } catch (e) {
      console.error("Error deleting post:", e);
      setError("Makale silinirken bir hata oluştu.");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [fetchPosts]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, error, addPost, updatePost, deletePost, fetchPosts };
}; 