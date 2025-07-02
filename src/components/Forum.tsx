import React, { useState, useEffect } from 'react';
import { Calendar, Eye, Tag, ArrowRight, Clock, TrendingUp } from 'lucide-react';
import { ForumPost } from '../types';
import { ForumService } from '../services/forumService';
import { useForum } from '../hooks/useForum';
import { useAuth } from '../hooks/useAuth';
import '../article-styles.css';
import { Link } from 'react-router-dom';

const Forum: React.FC = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [popularPosts, setPopularPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const [allPosts, popular] = await Promise.all([
          ForumService.getAllPosts(),
          ForumService.getPopularPosts(5)
        ]);
        setPosts(allPosts);
        setPopularPosts(popular);
      } catch (error) {
        console.error('Error fetching forum posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handlePostClick = async (post: ForumPost) => {
    setSelectedPost(post);
    // Görüntüleme sayısını artır
    await ForumService.incrementViewCount(post.id);
    // Posts listesini güncelle
    setPosts(prev => prev.map(p => 
      p.id === post.id ? { ...p, viewCount: p.viewCount + 1 } : p
    ));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Yardımcı fonksiyon: Markdown formatını HTML'ye çevirir
  const formatContent = (text: string) => {
    if (!text) return '';
    
    let formattedText = text;
    
    // **Bold** formatını işle
    formattedText = formattedText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Tırnak içindeki metinleri bold yap
    formattedText = formattedText.replace(/"([^"]+)"/g, '<strong class="quoted-bold">"$1"</strong>');
    
    // # Başlık formatını işle
    formattedText = formattedText.replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mb-4">$1</h1>');
    
    // ## Alt başlık formatını işle
    formattedText = formattedText.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-semibold mb-3 mt-6">$1</h2>');
    
    // ### Alt başlık formatını işle
    formattedText = formattedText.replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold mb-2 mt-4">$1</h3>');
    
    // Paragraf aralarına boşluk ekle
    formattedText = formattedText.replace(/\n\n/g, '</p><p class="mb-4">');
    
    // İlk ve son paragraf etiketlerini ekle
    if (formattedText && !formattedText.startsWith('<')) {
      formattedText = '<p class="mb-4">' + formattedText + '</p>';
    }
    
    return formattedText;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Forum yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (selectedPost) {
    const formattedContent = formatContent(selectedPost.content);

    return (
      <div className="bg-white">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              {selectedPost.title}
            </h1>
            <p className="mt-4 text-xl text-gray-500">
              Yazar: {selectedPost.authorName} · {new Date(selectedPost.createdAt).toLocaleDateString('tr-TR')}
            </p>
          </div>

          {selectedPost.imageUrl && (
            <div className="mb-12">
              <img 
                src={selectedPost.imageUrl} 
                alt={selectedPost.title} 
                className="w-full h-auto max-h-[500px] object-cover rounded-2xl shadow-lg"
              />
            </div>
          )}

          <div 
            className="prose prose-lg max-w-none" 
            dangerouslySetInnerHTML={{ __html: formattedContent }} 
          />
          
          <div className="mt-12 text-center">
            <button
              onClick={() => setSelectedPost(null)}
              className="inline-block bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tüm Makalelere Geri Dön
            </button>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Parfüm Dünyası Forum
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Parfüm dünyasının en güncel haberleri, ipuçları ve bilgileri
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h2 className="text-2xl font-serif font-bold text-charcoal-900 mb-6">
                Son Makaleler
              </h2>
              
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Henüz makale bulunmuyor.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <article
                      key={post.id}
                      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
                      onClick={() => handlePostClick(post)}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-serif font-bold text-charcoal-900 mb-2 hover:text-primary-600 transition-colors">
                              {post.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                              {post.excerpt}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              {formatDate(post.createdAt)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye size={14} />
                              {post.viewCount}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {post.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Popular Posts */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-serif font-bold text-charcoal-900 mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-primary-600" />
                Popüler Makaleler
              </h3>
              
              <div className="space-y-4">
                {popularPosts.map((post, index) => (
                  <div
                    key={post.id}
                    className="cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
                    onClick={() => handlePostClick(post)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="bg-primary-100 text-primary-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-medium text-charcoal-900 text-sm leading-tight mb-1">
                          {post.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Eye size={12} />
                          {post.viewCount}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* About Forum */}
            <div className="bg-gradient-to-br from-primary-50 to-cream-50 rounded-2xl p-6 border border-primary-100">
              <h3 className="text-lg font-serif font-bold text-charcoal-900 mb-3">
                Forum Hakkında
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Parfüm dünyasının en güncel gelişmelerini, ipuçlarını ve bilgilerini paylaştığımız platformumuz. 
                Her gün yeni içeriklerle parfüm severleri bilgilendiriyoruz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forum;