import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, MapPin, Award, Users, User, DollarSign, Phone } from 'lucide-react';
import { applicationsAPI } from '../services/api';
import toast from 'react-hot-toast';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await applicationsAPI.getMyApplicationsList();
      setApplications(response.data.applications);
    } catch (error) {
      toast.error('获取申请列表失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        text: '待审核',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-700',
        dotColor: 'bg-yellow-500'
      },
      submitted: {
        text: '已提交',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-700',
        dotColor: 'bg-gray-400'
      },
      reviewing: {
        text: '待审核',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-700',
        dotColor: 'bg-orange-500'
      },
      contacted: {
        text: '已联系',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-700',
        dotColor: 'bg-blue-500'
      },
      scheduled: {
        text: '已预约',
        bgColor: 'bg-indigo-100',
        textColor: 'text-indigo-700',
        dotColor: 'bg-indigo-500'
      },
      visited: {
        text: '已到院',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-700',
        dotColor: 'bg-purple-500'
      },
      enrolled: {
        text: '已入组',
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        dotColor: 'bg-green-500'
      },
      completed: {
        text: '已完成',
        bgColor: 'bg-emerald-100',
        textColor: 'text-emerald-700',
        dotColor: 'bg-emerald-500'
      },
      rejected: {
        text: '已拒绝',
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        dotColor: 'bg-red-500'
      },
      dropped: {
        text: '已淘汰',
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        dotColor: 'bg-red-400'
      },
      withdrawn: {
        text: '主动退出',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-700',
        dotColor: 'bg-gray-400'
      },
      approved: {
        text: '已通过',
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        dotColor: 'bg-green-500'
      },
      medical_check: {
        text: '体检阶段',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-700',
        dotColor: 'bg-blue-500'
      }
    };
    return configs[status] || {
      text: '未知状态',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-700',
      dotColor: 'bg-gray-400'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
        <span className="ml-2 text-gray-600">加载中...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">我的报名</h1>
          <p className="text-gray-600">查看您的试验报名申请状态</p>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">暂无报名记录</h2>
            <p className="text-gray-600 mb-6">您还没有报名任何试验项目</p>
            <Link to="/" className="btn btn-primary">
              浏览试验项目
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map(application => (
              <ApplicationCard 
                  key={application.id}
                application={application}
                  getStatusConfig={getStatusConfig}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 申请卡片组件
const ApplicationCard = ({ application, getStatusConfig }) => {
  const trial = application.trial;
  const isProxyApplication = application.applicationType === 'proxy';
  
  if (!trial) {
    return (
      <div className="card">
        <div className="text-center py-4 text-gray-500">
          试验信息加载中...
        </div>
      </div>
    );
  }

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between">
        <div className="flex-1">
          {/* 申请类型标识 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              {isProxyApplication ? (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    <Users className="w-3 h-3 mr-1" />
                    代理申请
                  </div>
                  <span className="text-sm text-gray-600">
                    为 <span className="font-semibold text-blue-600">{application.applicantName}</span> 申请
                  </span>
                </div>
              ) : (
                <div className="flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  <User className="w-3 h-3 mr-1" />
                  本人申请
                </div>
              )}
            </div>
            <div className="flex items-center">
              {(() => {
                const statusConfig = getStatusConfig(application.status);
                return (
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${statusConfig.dotColor}`}></div>
                    {statusConfig.text}
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {trial.title}
            </h3>
              <div className="text-sm text-gray-600">
                <span className="font-medium">{trial.hospital}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium text-gray-900 mr-2">疾病类型:</span>
              <span className="text-blue-600">{trial.disease}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium text-gray-900 mr-2">参与者:</span>
              <span className="text-green-600">{trial.participantType}</span>
            </div>
                         <div className="flex items-center text-sm text-gray-600">
               <span className="font-medium text-gray-900 mr-2">筛选系统:</span>
               <span className={trial.screeningSystem === '联网项目' ? 'text-green-600 font-semibold' : 'text-blue-600 font-semibold'}>
                 {trial.screeningSystem || '不联网项目'}
               </span>
             </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-1 text-gray-400" />
              <span>{trial.city}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Award className="w-4 h-4 mr-1 text-yellow-500" />
              <span className="font-semibold text-green-600">¥{trial.compensation}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium text-gray-900 mr-2">试验周期:</span>
              <span>{trial.duration}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium text-gray-900 mr-2">试验地点:</span>
              <span>{trial.hospital}</span>
            </div>
          </div>

          {/* 推荐费信息 - 仅代理申请显示 */}
          {isProxyApplication && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-orange-700">
                  <DollarSign className="w-4 h-4 mr-1" />
                  <span className="font-medium">推荐费:</span>
                  <span className="ml-1 font-semibold">¥{application.referralFeeAmount || trial.referralFee || 0}</span>
                </div>
                <div className="text-xs text-orange-600">
                  {application.referralFeePaid ? '已支付' : '待支付'}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
            <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
              申请时间: {new Date(application.createdAt || application.submittedAt).toLocaleString('zh-CN')}
            </div>
            {isProxyApplication && (
              <div className="flex items-center text-xs text-gray-400">
                <Phone className="w-3 h-3 mr-1" />
                {application.applicantPhone}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col space-y-2">
          <Link
            to={`/trial/${trial.id}`}
            className="btn btn-outline"
          >
            查看详情
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Applications; 