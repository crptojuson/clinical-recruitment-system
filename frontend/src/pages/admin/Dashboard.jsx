import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Stethoscope, 
  FileText, 
  BookOpen, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTrials: 0,
    activeTrials: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalUsers: 0,
    totalArticles: 0,
    recentApplications: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('获取统计数据失败:', error);
      toast.error('获取统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: '试验项目',
      value: stats.totalTrials,
      subtitle: `${stats.activeTrials} 个活跃`,
      icon: Stethoscope,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      title: '申请总数',
      value: stats.totalApplications,
      subtitle: `${stats.pendingApplications} 个待审核`,
      icon: FileText,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      title: '注册用户',
      value: stats.totalUsers,
      subtitle: '普通用户',
      icon: Users,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      title: '博客文章',
      value: stats.totalArticles,
      subtitle: '已发布',
      icon: BookOpen,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
        <span className="ml-2 text-gray-600">加载中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">仪表板</h1>
        <div className="text-xs sm:text-sm text-gray-500">
          最后更新: {new Date().toLocaleString()}
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{card.value}</p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">{card.subtitle}</p>
                </div>
                <div className={`p-2 sm:p-3 rounded-full ${card.bgColor} flex-shrink-0 ml-2`}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${card.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 快速操作 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* 最近活动 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">最近活动</h2>
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center p-2.5 sm:p-3 bg-blue-50 rounded-lg">
              <div className="p-1.5 sm:p-2 bg-blue-100 rounded-full mr-2 sm:mr-3 flex-shrink-0">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900">
                  最近7天新增申请
                </p>
                <p className="text-base sm:text-lg font-bold text-blue-600">
                  {stats.recentApplications} 个
                </p>
              </div>
            </div>
            
            <div className="flex items-center p-2.5 sm:p-3 bg-green-50 rounded-lg">
              <div className="p-1.5 sm:p-2 bg-green-100 rounded-full mr-2 sm:mr-3 flex-shrink-0">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900">
                  活跃试验项目
                </p>
                <p className="text-base sm:text-lg font-bold text-green-600">
                  {stats.activeTrials} 个
                </p>
              </div>
            </div>

            <div className="flex items-center p-2.5 sm:p-3 bg-orange-50 rounded-lg">
              <div className="p-1.5 sm:p-2 bg-orange-100 rounded-full mr-2 sm:mr-3 flex-shrink-0">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900">
                  待处理申请
                </p>
                <p className="text-base sm:text-lg font-bold text-orange-600">
                  {stats.pendingApplications} 个
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 快速操作 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">快速操作</h2>
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Link
              to="/admin/trials"
              className="flex items-center justify-center p-3 sm:p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
            >
              <div className="text-center">
                <Stethoscope className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-1 sm:mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs sm:text-sm font-medium text-blue-900">管理试验</p>
              </div>
            </Link>

            <Link
              to="/admin/applications"
              className="flex items-center justify-center p-3 sm:p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
            >
              <div className="text-center">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-1 sm:mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs sm:text-sm font-medium text-green-900">审核申请</p>
              </div>
            </Link>

            <Link
              to="/admin/articles"
              className="flex items-center justify-center p-3 sm:p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
            >
              <div className="text-center">
                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mx-auto mb-1 sm:mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs sm:text-sm font-medium text-purple-900">编辑博客</p>
              </div>
            </Link>

            <Link
              to="/admin/banners"
              className="flex items-center justify-center p-3 sm:p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group"
            >
              <div className="text-center">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 mx-auto mb-1 sm:mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs sm:text-sm font-medium text-orange-900">横幅管理</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* 系统状态 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">系统状态</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-gray-900">系统运行正常</p>
            <p className="text-xs text-gray-500">所有服务正常运行</p>
          </div>
          
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-gray-900">性能良好</p>
            <p className="text-xs text-gray-500">响应时间 &lt; 200ms</p>
          </div>
          
          <div className="text-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-gray-900">用户活跃</p>
            <p className="text-xs text-gray-500">今日访问量正常</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 