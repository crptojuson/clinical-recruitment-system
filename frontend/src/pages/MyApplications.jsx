import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Calendar, 
  DollarSign,
  Eye,
  Clock,
  Check,
  X,
  AlertCircle,
  Award,
  Filter,
  Search
} from 'lucide-react';
import { applicationsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const MyApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchApplications();
  }, [currentPage, statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10
      };
      
      if (statusFilter) params.status = statusFilter;

      const response = await applicationsAPI.getMyApplicationsList(params);
      if (response.data.success) {
        setApplications(response.data.data.applications);
        setTotalPages(response.data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('获取申请列表失败:', error);
      setError(error.response?.data?.message || '获取申请列表失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'reviewing': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'approved': return <Check className="w-4 h-4 text-green-500" />;
      case 'rejected': return <X className="w-4 h-4 text-red-500" />;
      case 'medical_check': return <FileText className="w-4 h-4 text-purple-500" />;
      case 'enrolled': return <Award className="w-4 h-4 text-emerald-500" />;
      case 'completed': return <Check className="w-4 h-4 text-green-600" />;
      case 'withdrawn': return <X className="w-4 h-4 text-gray-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': '待审核',
      'reviewing': '审核中',
      'approved': '已通过',
      'rejected': '已拒绝',
      'medical_check': '体检阶段',
      'enrolled': '已入组',
      'completed': '已完成',
      'withdrawn': '已撤回',
      'failed': '失败'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewing': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'medical_check': return 'bg-purple-100 text-purple-800';
      case 'enrolled': return 'bg-emerald-100 text-emerald-800';
      case 'completed': return 'bg-green-200 text-green-900';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredApplications = applications.filter(app => 
    app.trial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.trial.hospital.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && applications.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">我的报名</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">查看您的所有试验申请记录和进度</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-6">
        {/* 筛选和搜索 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* 状态筛选 */}
            <div className="flex items-center">
              <Filter className="w-4 h-4 mr-2 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">全部状态</option>
                <option value="pending">待审核</option>
                <option value="reviewing">审核中</option>
                <option value="approved">已通过</option>
                <option value="rejected">已拒绝</option>
                <option value="medical_check">体检阶段</option>
                <option value="enrolled">已入组</option>
                <option value="completed">已完成</option>
                <option value="withdrawn">已撤回</option>
              </select>
            </div>

            {/* 搜索 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索试验项目..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mr-2" />
              <span className="text-sm sm:text-base text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* 申请列表 */}
        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
            <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">暂无申请记录</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              {searchTerm || statusFilter ? '没有找到符合条件的申请' : '您还没有申请任何试验项目'}
            </p>
            <button
              onClick={() => navigate('/trials')}
              className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              浏览试验项目
            </button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredApplications.map((application) => (
              <div
                key={application.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    {/* 试验信息 */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4">
                      <div className="mb-2 sm:mb-0">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                          {application.trial.title}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600">{application.trial.hospital}</p>
                      </div>
                      
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                          {getStatusIcon(application.status)}
                          <span className="ml-1">{getStatusText(application.status)}</span>
                        </span>
                      </div>
                    </div>

                    {/* 项目详情 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">

                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 mr-2" />
                        补助 ¥{application.trial.compensation}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(application.submittedAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* 推荐信息 */}
                    {application.referrer && (
                      <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-600 mb-3 sm:mb-4">
                        <div className="flex items-center mb-1 sm:mb-0">
                          <Award className="w-4 h-4 mr-2" />
                          推荐人：{application.referrer.name}
                        </div>
                        {application.trial.referralFee > 0 && (
                          <span className="ml-0 sm:ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            推荐费 ¥{application.trial.referralFee}
                          </span>
                        )}
                      </div>
                    )}

                    {/* 进度提示 */}
                    {application.status === 'medical_check' && application.medicalCheckDate && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
                        <p className="text-purple-800 text-xs sm:text-sm">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          体检时间：{new Date(application.medicalCheckDate).toLocaleString()}
                        </p>
                      </div>
                    )}

                    {application.status === 'enrolled' && application.enrollmentDate && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
                        <p className="text-green-800 text-xs sm:text-sm">
                          <Award className="w-4 h-4 inline mr-1" />
                          入组时间：{new Date(application.enrollmentDate).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 操作按钮 */}
                  <div className="mt-3 sm:mt-0 sm:ml-4">
                    <button
                      onClick={() => navigate(`/applications/${application.id}`)}
                      className="flex items-center w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      查看详情
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 sm:mt-8">
            <div className="flex space-x-1 sm:space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                上一页
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-2 sm:px-3 py-1.5 sm:py-2 text-sm border rounded-lg ${
                    currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications; 