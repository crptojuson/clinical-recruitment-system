import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Clock, ChevronRight, Heart, Users, Building, Award, Filter, X, TrendingUp, BookOpen, Calendar, Eye, Bot, MessageCircle, Phone } from 'lucide-react';
import { trialsAPI, articlesAPI } from '../services/api';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';
import AIConsultModal from '../components/AIConsultModal';

const Home = () => {
  const [trials, setTrials] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();
  const [filters, setFilters] = useState({
    keyword: '',
    disease: '',
    city: '',
    participantType: '',
    screeningSystem: '',
    compensationMin: '',
    compensationMax: ''
  });
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [selectedTrial, setSelectedTrial] = useState(null);
  const [diseases, setDiseases] = useState([]);
  const [cities, setCities] = useState([]);
  const [participantTypes, setParticipantTypes] = useState([]);
  const [screeningSystems, setScreeningSystems] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [customerServiceOpen, setCustomerServiceOpen] = useState(false);

  // 获取筛选选项
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [diseasesRes, citiesRes, participantTypesRes, screeningSystemsRes] = await Promise.all([
          trialsAPI.getDiseases(),
          trialsAPI.getCities(),
          trialsAPI.getParticipantTypes(),
          trialsAPI.getScreeningSystems()
        ]);
        setDiseases(diseasesRes.data.diseases);
        setCities(citiesRes.data.cities);
        setParticipantTypes(participantTypesRes.data.participantTypes);
        setScreeningSystems(screeningSystemsRes.data.screeningSystems);
      } catch (error) {
        console.error('获取筛选选项失败:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  // 获取博客文章
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const response = await articlesAPI.getPublicArticles({ 
          featured: true,
          limit: 4 
        });
        setBlogPosts(response.data.articles || []);
      } catch (error) {
        console.error('获取博客文章失败:', error);
      }
    };

    fetchBlogPosts();
  }, []);

  // 获取试验列表
  useEffect(() => {
    fetchTrials();
  }, [filters]);

  const fetchTrials = async () => {
    setLoading(true);
    try {
      const response = await trialsAPI.getTrials(filters);
      setTrials(response.data.trials);
    } catch (error) {
      toast.error('获取试验列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleOpenAIConsult = (trial) => {
    setSelectedTrial(trial);
    setAiModalOpen(true);
  };

  const clearFilters = () => {
    setFilters({
      keyword: '',
      disease: '',
      city: '',
      participantType: '',
      screeningSystem: '',
      compensationMin: '',
      compensationMax: ''
    });
    setShowFilters(false);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  // 博客文章数据从API获取
  const [blogPosts, setBlogPosts] = useState([]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-700"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              试药通
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                临床试验招募平台
              </span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8 lg:mb-12 max-w-3xl mx-auto leading-relaxed">
              专业的临床试验信息服务平台，为患者精准匹配优质医疗研究项目，推动医学科研发展
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8 text-white/90">
              <div className="flex items-center">
                <div className="w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12 bg-white/20 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                  <Heart className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6" />
                </div>
                <div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold">1000+</div>
                  <div className="text-xs sm:text-sm">临床项目</div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12 bg-white/20 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                  <Users className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6" />
                </div>
                <div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold">10000+</div>
                  <div className="text-xs sm:text-sm">注册用户</div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12 bg-white/20 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                  <Building className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6" />
                </div>
                <div>
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold">100+</div>
                  <div className="text-xs sm:text-sm">合作机构</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="relative -mt-6 sm:-mt-8 mb-6 sm:mb-8 lg:mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 lg:p-8">
            {/* 主搜索框 */}
            <div className="relative mb-4 sm:mb-6">
              <div className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6" />
              </div>
              <input
                type="text"
                placeholder="搜索试验项目、疾病或医院..."
                value={filters.keyword}
                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                className="w-full pl-10 sm:pl-12 lg:pl-14 pr-12 sm:pr-14 lg:pr-16 py-3 sm:py-4 text-sm sm:text-base lg:text-lg border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:border-primary-500 focus:ring-0 transition-colors"
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-200 ${
                  hasActiveFilters || showFilters
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* 高级筛选 */}
            {showFilters && (
              <div className="border-t border-gray-200 pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                  <select
                    value={filters.disease}
                    onChange={(e) => handleFilterChange('disease', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-0 transition-colors"
                  >
                    <option value="">选择疾病类型</option>
                    {diseases.map(disease => (
                      <option key={disease} value={disease}>
                        {disease}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-0 transition-colors"
                  >
                    <option value="">选择城市</option>
                    {cities.map(city => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filters.participantType}
                    onChange={(e) => handleFilterChange('participantType', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-0 transition-colors"
                  >
                    <option value="">选择参与者类型</option>
                    {participantTypes.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filters.screeningSystem}
                    onChange={(e) => handleFilterChange('screeningSystem', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-0 transition-colors"
                  >
                    <option value="">选择筛选系统</option>
                    {screeningSystems.map(system => (
                      <option key={system} value={system}>
                        {system}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    placeholder="最低补贴 (元)"
                    value={filters.compensationMin}
                    onChange={(e) => handleFilterChange('compensationMin', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-0 transition-colors"
                  />

                  <input
                    type="number"
                    placeholder="最高补贴 (元)"
                    value={filters.compensationMax}
                    onChange={(e) => handleFilterChange('compensationMax', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-0 transition-colors"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    找到 <span className="font-semibold text-primary-600">{trials.length}</span> 个试验项目
                  </div>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center text-sm text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      <X className="w-4 h-4 mr-1" />
                      清除筛选条件
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 试药科普博客模块 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl overflow-hidden">
          {/* 博客模块标题 */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2">试药科普</h2>
                <p className="text-indigo-100 text-sm sm:text-base">了解临床试验知识，安全参与医学研究</p>
              </div>
              <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white/80" />
            </div>
          </div>

          {/* 博客内容 */}
          <div className="p-4 sm:p-6 lg:p-8">
            {/* 精选文章 */}
            {blogPosts.filter(post => post.featured).map(post => (
              <div key={post.id} className="mb-4 sm:mb-6 lg:mb-8 p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl border border-indigo-100">
                <div className="flex items-start justify-between mb-2 sm:mb-3 lg:mb-4">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-2 sm:px-3 py-1 rounded-full">
                      精选
                    </span>
                    <span className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2 sm:px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {post.views}
                  </div>
                </div>
                
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 hover:text-indigo-600 transition-colors cursor-pointer">
                  {post.title}
                </h3>
                
                <p className="text-gray-600 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base line-clamp-2">
                  {post.summary}
                </p>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center text-xs sm:text-sm text-gray-500">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span>{post.publishDate}</span>
                    <span className="mx-1 sm:mx-2">•</span>
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span>{post.readTime}</span>
                    <span className="mx-1 sm:mx-2">•</span>
                    <span>{post.author}</span>
                  </div>
                  
                  <Link 
                    to={`/blog/${post.id}`}
                    className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center self-start sm:self-auto"
                  >
                    阅读全文
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}

            {/* 其他文章网格 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {blogPosts.filter(post => !post.featured).map(post => (
                <Link 
                  key={post.id} 
                  to={`/blog/${post.id}`}
                  className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 hover:bg-gray-100 transition-colors cursor-pointer group block"
                >
                  <div className="flex items-center mb-2 sm:mb-3">
                    <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 sm:px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                    <div className="flex items-center text-gray-500 text-xs ml-auto">
                      <Eye className="w-3 h-3 mr-1" />
                      {post.views}
                    </div>
                  </div>
                  
                  <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                  
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                    {post.summary}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {post.publishDate}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {post.readTime}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* 查看更多按钮 */}
            <div className="text-center mt-4 sm:mt-6 lg:mt-8">
              <Link 
                to="/blog"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-medium transition-all duration-200 transform hover:scale-105 inline-block text-sm sm:text-base"
              >
                查看更多科普文章
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Trials List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="loading-spinner mb-6"></div>
            <span className="text-gray-600 text-xl">加载中...</span>
          </div>
        ) : trials.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-gray-600 text-xl mb-4">暂无符合条件的试验项目</p>
            <p className="text-gray-500">请尝试调整搜索条件或筛选选项</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trials.map(trial => (
                              <TrialCard 
                                key={trial.id} 
                                trial={trial} 
                                isAuthenticated={isAuthenticated}
                                onAIConsult={handleOpenAIConsult}
                              />
            ))}
          </div>
        )}
      </div>

      {/* AI咨询弹窗 */}
      <AIConsultModal 
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        trial={selectedTrial}
      />

      {/* 客服漂浮按钮 */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <button
          onClick={() => setCustomerServiceOpen(true)}
          className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
          title="联系客服"
        >
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
        </button>
      </div>

      {/* 客服弹窗 */}
      {customerServiceOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            {/* 弹窗头部 */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 sm:p-6 rounded-t-2xl sm:rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                    <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">专属客服</h3>
                    <p className="text-green-100 text-xs sm:text-sm">为您提供专业咨询服务</p>
                  </div>
                </div>
                <button
                  onClick={() => setCustomerServiceOpen(false)}
                  className="text-white/80 hover:text-white p-1 sm:p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* 弹窗内容 */}
            <div className="p-4 sm:p-6">
              {/* 服务介绍 */}
              <div className="text-center mb-4 sm:mb-6">
                <div className="inline-flex items-center bg-green-50 text-green-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  专业医学顾问在线
                </div>
                <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-2">添加微信，获得专属服务</h4>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                  我们的专业医学顾问将为您提供：
                </p>
              </div>

              {/* 服务列表 */}
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex items-start">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm sm:text-base">个性化试验匹配</div>
                    <div className="text-xs sm:text-sm text-gray-600">根据您的具体情况推荐最适合的临床试验项目</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm sm:text-base">专业医学解答</div>
                    <div className="text-xs sm:text-sm text-gray-600">解答试验相关疑问，提供专业医学建议</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm sm:text-base">全程跟踪服务</div>
                    <div className="text-xs sm:text-sm text-gray-600">从报名到参与，全程专业指导和支持</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mt-1.5 sm:mt-2 mr-2 sm:mr-3 flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm sm:text-base">优先推荐机会</div>
                    <div className="text-xs sm:text-sm text-gray-600">第一时间获得最新、最优质的试验项目信息</div>
                  </div>
                </div>
              </div>

              {/* 微信二维码区域 */}
              <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center">
                <div className="w-36 h-36 sm:w-48 sm:h-48 bg-white rounded-lg sm:rounded-xl shadow-sm mx-auto mb-3 sm:mb-4 flex items-center justify-center border border-gray-200 sm:border-2">
                  <img 
                    src="/wechat-qr.png" 
                    alt="微信二维码" 
                    className="w-32 h-32 sm:w-40 sm:h-40 object-contain"
                    onError={(e) => {
                      // 如果图片加载失败，显示占位符
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  {/* 占位符，当图片加载失败时显示 */}
                  <div className="text-center" style={{display: 'none'}}>
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-3 mx-auto">
                      <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">微信二维码</p>
                    <p className="text-xs text-gray-500 mt-1">请添加 wechat-qr.png 到 public 目录</p>
                  </div>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <p className="font-medium text-gray-900 text-sm sm:text-base">扫码添加客服微信</p>
                  <p className="text-xs sm:text-sm text-gray-600">微信号：<span className="font-mono bg-gray-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm">shiyaotong01</span></p>
                  <p className="text-xs text-gray-500">工作时间：周一至周日 9:00-21:00</p>
                </div>
              </div>

              {/* 话术提示 */}
              <div className="mt-4 sm:mt-6 bg-blue-50 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <h5 className="font-medium text-blue-900 mb-2 flex items-center text-sm sm:text-base">
                  <Bot className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  添加时请说明
                </h5>
                <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 border border-blue-100">
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    "您好，我从临床试验招募平台看到您的联系方式，希望了解适合我的临床试验项目，请帮我推荐一下。"
                  </p>
                </div>
                <p className="text-xs text-blue-600 mt-1 sm:mt-2">
                  💡 说明来源可以让客服更好地为您服务
                </p>
              </div>

              {/* 联系按钮 */}
              <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
                <button
                  onClick={() => {
                    // 复制微信号到剪贴板
                    navigator.clipboard.writeText('shiyaotong01');
                    toast.success('微信号已复制到剪贴板');
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
                >
                  复制微信号
                </button>
                <button
                  onClick={() => setCustomerServiceOpen(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-colors text-sm sm:text-base"
                >
                  稍后联系
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 试验卡片组件
const TrialCard = ({ trial, isAuthenticated, onAIConsult }) => {
  // 检查报名时间状态
  const now = new Date();
  const isRegistrationNotStarted = trial.registrationStartDate && now < new Date(trial.registrationStartDate);
  const isRegistrationExpired = trial.registrationDeadline && now > new Date(trial.registrationDeadline);
  const isTrialCompleted = trial.endDate && now > new Date(trial.endDate);
  
  const handleViewMap = () => {
    if (!trial.location) return;
    
    // 构建高德地图URL
    const mapUrl = `https://uri.amap.com/marker?position=&name=${encodeURIComponent(trial.hospital)}&address=${encodeURIComponent(trial.location)}&src=myapp`;
    
    // 在新窗口打开地图
    window.open(mapUrl, '_blank');
  };
  
  return (
    <div className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="p-3 sm:p-4">
        <div className="flex flex-col lg:flex-row lg:items-start">
          {/* 左侧内容 */}
          <div className="flex-1">
            {/* 标题、AI按钮和推荐费 */}
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-primary-600 transition-colors leading-tight flex-1 pr-2">
                {trial.title}
              </h3>
              <div className="flex items-center gap-1 sm:gap-2">
                {/* AI咨询按钮 */}
                <button
                  onClick={() => onAIConsult(trial)}
                  className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-full text-xs font-medium transition-all duration-200 transform hover:scale-105 shadow-md"
                  title="AI药物咨询"
                >
                  <Bot className="w-3 h-3" />
                  <span className="hidden sm:inline">AI咨询</span>
                  <span className="sm:hidden">AI</span>
                </button>
              {isAuthenticated && trial.referralFee > 0 && (
                  <div className="flex items-center bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                    <Award className="w-3 h-3 mr-1" />
                  <span className="font-bold">¥{trial.referralFee}</span>
                </div>
              )}
              </div>
            </div>

            {/* 详情信息 - 一行显示 */}
            <div className="text-gray-600 mb-2 text-xs line-clamp-1">
              {trial.exclusionCriteria || '具体详情请查看项目详情页面'}
            </div>

            {/* 疾病标签和参与者类型 - 更紧凑 */}
            <div className="mb-2 flex flex-wrap gap-1">
              <span className="inline-flex items-center px-2 py-0.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full text-xs font-medium">
                <Heart className="w-3 h-3 mr-1" />
                {trial.disease}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                trial.participantType === '健康者' 
                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800'
                  : 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-800'
              }`}>
                <Users className="w-3 h-3 mr-1" />
                {trial.participantType}
              </span>
              {/* 筛选系统标签 */}
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                trial.screeningSystem === '联网项目' 
                  ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800'
                  : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800'
              }`}>
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {trial.screeningSystem || '不联网项目'}
              </span>
              {/* 截止状态标签 */}
              {isTrialCompleted && (
                <span className="inline-flex items-center px-2 py-0.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full text-xs font-medium">
                  <Clock className="w-3 h-3 mr-1" />
                  试验已结束
                </span>
              )}
              {!isTrialCompleted && isRegistrationNotStarted && (
                <span className="inline-flex items-center px-2 py-0.5 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 rounded-full text-xs font-medium">
                  <Clock className="w-3 h-3 mr-1" />
                  报名未开始
                </span>
              )}
              {!isTrialCompleted && !isRegistrationNotStarted && isRegistrationExpired && (
                <span className="inline-flex items-center px-2 py-0.5 bg-gradient-to-r from-red-100 to-pink-100 text-red-700 rounded-full text-xs font-medium">
                  <Clock className="w-3 h-3 mr-1" />
                  报名已截止
                </span>
              )}
              {!isTrialCompleted && !isRegistrationNotStarted && !isRegistrationExpired && trial.registrationDeadline && (
                <span className="inline-flex items-center px-2 py-0.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-xs font-medium">
                  <Clock className="w-3 h-3 mr-1" />
                  截止: {new Date(trial.registrationDeadline).toLocaleDateString()}
                </span>
              )}
              {!isTrialCompleted && !isRegistrationNotStarted && !isRegistrationExpired && !trial.registrationDeadline && trial.registrationStartDate && (
                <span className="inline-flex items-center px-2 py-0.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full text-xs font-medium">
                  <Clock className="w-3 h-3 mr-1" />
                  可报名
                </span>
              )}
            </div>

            {/* 关键信息网格 - 更紧凑 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-2 rounded-lg">
                <div className="flex items-center mb-1">
                  <Award className="w-3 h-3 text-green-600 mr-1" />
                  <span className="text-xs font-medium text-green-800">补贴</span>
                </div>
                <div className="text-sm font-bold text-green-700">¥{trial.compensation}</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-2 rounded-lg">
                <div className="flex items-center mb-1">
                  <MapPin className="w-3 h-3 text-purple-600 mr-1" />
                  <span className="text-xs font-medium text-purple-800">地点</span>
                </div>
                <div className="text-xs font-semibold text-purple-700">{trial.city}</div>
                <div className="text-xs text-purple-600 line-clamp-1">{trial.hospital}</div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-2 rounded-lg">
                <div className="flex items-center mb-1">
                  <Clock className="w-3 h-3 text-blue-600 mr-1" />
                  <span className="text-xs font-medium text-blue-800">周期</span>
                </div>
                <div className="text-xs text-blue-700 leading-tight">
                  {trial.duration || '待定'}
              </div>
            </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-2 rounded-lg">
                <div className="flex items-center mb-1">
                  <Users className="w-3 h-3 text-orange-600 mr-1" />
                  <span className="text-xs font-medium text-orange-800">参与</span>
                </div>
                <div className="text-xs font-bold text-orange-700">{trial.currentSubjects || 0}人</div>
              </div>
            </div>
          </div>

          {/* 右侧操作区 - 更紧凑 */}
          <div className="mt-3 lg:mt-0 lg:ml-4 flex flex-col items-center">
            {/* 状态指示器 */}
            {isTrialCompleted ? (
              <div className="flex items-center text-gray-600 mb-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                <span className="text-xs font-medium">已结束</span>
              </div>
            ) : isRegistrationExpired ? (
              <div className="flex items-center text-red-600 mb-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                <span className="text-xs font-medium">已截止</span>
              </div>
            ) : trial.status === 'recruiting' ? (
              <div className="flex items-center text-green-600 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-xs font-medium">招募中</span>
              </div>
            ) : null}
            
            <Link
              to={`/trial/${trial.id}`}
              className={`group/btn px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 transform shadow-sm flex items-center ${
                isTrialCompleted || isRegistrationExpired
                  ? 'bg-gray-400 text-white cursor-default'
                  : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white hover:scale-105 hover:shadow-md'
              }`}
            >
              {isTrialCompleted ? '已结束' : isRegistrationExpired ? '已截止' : '查看详情'}
              {!isTrialCompleted && !isRegistrationExpired && (
                <ChevronRight className="w-3 h-3 ml-1 group-hover/btn:translate-x-1 transition-transform" />
              )}
            </Link>
            
            {isAuthenticated && trial.referralFee > 0 && (
              <div className="mt-1 text-center">
                <div className="flex items-center text-xs text-orange-600">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span>推荐有奖</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 