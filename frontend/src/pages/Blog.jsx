import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Calendar, 
  Clock, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Tag, 
  User,
  ArrowLeft,
  Share2,
  Bookmark,
  Filter
} from 'lucide-react';
import { articlesAPI } from '../services/api';
import toast from 'react-hot-toast';

const Blog = () => {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const categories = ["全部", "基础知识", "安全指南", "法规知识", "政策解读", "参与指南", "安全保障"];

  // 获取文章列表
  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory && selectedCategory !== '全部') {
        params.category = selectedCategory;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      const response = await articlesAPI.getPublicArticles(params);
      const articlesData = response.data.articles || [];
      setArticles(articlesData);
      setFilteredArticles(articlesData);
    } catch (error) {
      console.error('获取文章列表失败:', error);
      toast.error('获取文章列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取文章详情
  const fetchArticleDetail = async (id) => {
    try {
      setLoading(true);
      const response = await articlesAPI.getArticleById(id);
      const article = response.data.article;
      setSelectedArticle(article);
      
      // 增加阅读量
      await articlesAPI.incrementViews(id);
      
      // 获取相关文章推荐
      const relatedResponse = await articlesAPI.getRelatedArticles(id);
      setRelatedArticles(relatedResponse.data.articles || []);
    } catch (error) {
      console.error('获取文章详情失败:', error);
      toast.error('获取文章详情失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (articleId) {
      fetchArticleDetail(articleId);
    } else {
      fetchArticles();
    }
  }, [articleId]);

  useEffect(() => {
    if (!articleId) {
      fetchArticles();
    }
  }, [searchTerm, selectedCategory]);

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
    navigate(`/blog/${article.id}`);
  };

  const handleBackToList = () => {
    setSelectedArticle(null);
    navigate('/blog');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // 文章详情页面
  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 返回按钮 */}
          <button
            onClick={handleBackToList}
            className="flex items-center text-indigo-600 hover:text-indigo-700 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回文章列表
          </button>

          {/* 文章内容 */}
          <article className="bg-white rounded-3xl shadow-xl overflow-hidden">
            {/* 文章头部 */}
            <div className="p-8 border-b border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <span className="bg-indigo-100 text-indigo-700 text-sm font-medium px-4 py-2 rounded-full">
                  {selectedArticle.category}
                </span>
                <div className="flex items-center space-x-4 text-gray-500 text-sm">
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {selectedArticle.views || 0}
                  </div>
                  <button className="flex items-center hover:text-indigo-600 transition-colors">
                    <Share2 className="w-4 h-4 mr-1" />
                    分享
                  </button>
                  <button className="flex items-center hover:text-indigo-600 transition-colors">
                    <Bookmark className="w-4 h-4 mr-1" />
                    收藏
                  </button>
                </div>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                {selectedArticle.title}
              </h1>
              
              <div className="flex items-center text-gray-600 mb-6">
                <div className="flex items-center mr-6">
                  <User className="w-4 h-4 mr-2" />
                  <span>{selectedArticle.author}</span>
                </div>
                <div className="flex items-center mr-6">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{formatDate(selectedArticle.publishDate)}</span>
                </div>
                {selectedArticle.readTime && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{selectedArticle.readTime}</span>
                  </div>
                )}
              </div>
              
              <p className="text-xl text-gray-700 leading-relaxed">
                {selectedArticle.summary}
              </p>
            </div>

            {/* 文章正文 */}
            <div className="p-8">
              <div 
                className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900"
                dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
              />
              
              {/* 标签 */}
              {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">相关标签</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>

          {/* 相关文章推荐 */}
          {relatedArticles.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">相关文章推荐</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedArticles.map(article => (
                  <div
                    key={article.id}
                    onClick={() => handleArticleClick(article)}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-indigo-600 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {article.summary}
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span className="mr-4">{formatDate(article.publishDate)}</span>
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{article.readTime || '阅读'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 文章列表页面
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">知识博客</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            获取最新的临床试验知识、安全指南和参与须知，让您更好地了解医学研究
          </p>
        </div>

        {/* 搜索和筛选 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索文章标题、内容或标签..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                筛选
              </button>
            </div>
          </div>

          {/* 分类筛选 */}
          {(showFilters || selectedCategory) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category === selectedCategory ? '' : category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
                {selectedCategory && (
                  <span className="px-3 py-2 text-sm text-gray-500 flex items-center">
                    找到 {filteredArticles.length} 篇文章
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 精选文章 */}
        {!searchTerm && !selectedCategory && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">精选文章</h2>
            {articles.filter(article => article.featured).map(article => (
              <div
                key={article.id}
                onClick={() => handleArticleClick(article)}
                className="bg-white rounded-3xl shadow-xl p-8 mb-6 cursor-pointer hover:shadow-2xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-sm font-bold px-4 py-2 rounded-full mr-4">
                      精选
                    </span>
                    <span className="bg-indigo-100 text-indigo-700 text-sm font-medium px-4 py-2 rounded-full">
                      {article.category}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Eye className="w-4 h-4 mr-1" />
                    {article.views || 0}
                  </div>
                </div>
                
                <h3 className="text-3xl font-bold text-gray-900 mb-4 hover:text-indigo-600 transition-colors">
                  {article.title}
                </h3>
                
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                  {article.summary}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-500 text-sm">
                    <User className="w-4 h-4 mr-2" />
                    <span className="mr-6">{article.author}</span>
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="mr-6">{formatDate(article.publishDate)}</span>
                    {article.readTime && (
                      <>
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{article.readTime}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center text-indigo-600">
                    <span className="mr-2">阅读全文</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 所有文章 */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            {searchTerm || selectedCategory ? '搜索结果' : '所有文章'}
          </h2>
          
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-500 mb-2">暂无文章</p>
              <p className="text-gray-400">
                {searchTerm || selectedCategory ? '尝试调整搜索条件' : '敬请期待更多内容'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map(article => (
                <div
                  key={article.id}
                  onClick={() => handleArticleClick(article)}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer overflow-hidden"
                >
                  {article.imageUrl && (
                    <img 
                      src={article.imageUrl} 
                      alt={article.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-indigo-100 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full">
                        {article.category}
                      </span>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Eye className="w-3 h-3 mr-1" />
                        {article.views || 0}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-indigo-600 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {article.summary}
                    </p>
                    
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {article.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                          >
                            <Tag className="w-2 h-2 mr-1" />
                            {tag}
                          </span>
                        ))}
                        {article.tags.length > 3 && (
                          <span className="text-xs text-gray-500">+{article.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        <span>{article.author}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{formatDate(article.publishDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Blog; 