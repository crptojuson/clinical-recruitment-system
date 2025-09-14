import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Calendar, 
  DollarSign,
  Check,
  Clock,
  AlertCircle,
  X,
  FileText,
  Award,
  Activity
} from 'lucide-react';
import { applicationsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [statusProgress, setStatusProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    fetchApplicationDetail();
  }, [id]);

  const fetchApplicationDetail = async () => {
    try {
      setLoading(true);
      const response = await applicationsAPI.getApplicationDetail(id);
      if (response.data.success) {
        setApplication(response.data.data.application);
        setStatusProgress(response.data.data.statusProgress);
      }
    } catch (error) {
      console.error('获取申请详情失败:', error);
      setError(error.response?.data?.message || '获取申请详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!window.confirm('确定要撤回此申请吗？此操作不可撤销。')) {
      return;
    }

    try {
      setWithdrawing(true);
      const response = await applicationsAPI.withdrawApplication(id, '用户主动撤回');
      
      if (response.data.success) {
        alert('申请已撤回');
        fetchApplicationDetail(); // 刷新数据
      }
    } catch (error) {
      alert(error.response?.data?.message || '撤回申请失败');
    } finally {
      setWithdrawing(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'reviewing': return <Activity className="w-5 h-5 text-blue-500" />;
      case 'approved': return <Check className="w-5 h-5 text-green-500" />;
      case 'rejected': return <X className="w-5 h-5 text-red-500" />;
      case 'medical_check': return <FileText className="w-5 h-5 text-purple-500" />;
      case 'enrolled': return <Award className="w-5 h-5 text-emerald-500" />;
      case 'completed': return <Check className="w-5 h-5 text-green-600" />;
      case 'withdrawn': return <X className="w-5 h-5 text-gray-500" />;
      case 'failed': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
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
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'reviewing': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      case 'medical_check': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'enrolled': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'completed': return 'text-green-700 bg-green-100 border-green-300';
      case 'withdrawn': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">加载失败</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/applications')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            返回申请列表
          </button>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">申请不存在</h2>
          <button
            onClick={() => navigate('/applications')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            返回申请列表
          </button>
        </div>
      </div>
    );
  }

  const canWithdraw = ['pending', 'reviewing', 'approved'].includes(application.status);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">申请详情</h1>
            </div>
            
            {canWithdraw && (
              <button
                onClick={handleWithdraw}
                disabled={withdrawing}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50"
              >
                {withdrawing ? '撤回中...' : '撤回申请'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 当前状态 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">申请状态</h2>
            <div className={`flex items-center px-3 py-1 rounded-full border ${getStatusColor(application.status)}`}>
              {getStatusIcon(application.status)}
              <span className="ml-2 font-medium">{getStatusText(application.status)}</span>
            </div>
          </div>

          {/* 进度条 */}
          {statusProgress && !statusProgress.isFailed && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                {statusProgress.steps.map((step, index) => (
                  <div key={step.key} className="flex flex-col items-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      step.completed 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }`}>
                      {step.completed ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <span className={`mt-2 text-xs font-medium ${
                      step.completed ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </span>
                    {index < statusProgress.steps.length - 1 && (
                      <div className={`absolute h-0.5 w-full mt-4 ${
                        step.completed ? 'bg-green-500' : 'bg-gray-200'
                      }`} style={{ left: '50%', width: 'calc(100% - 2rem)' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 审核信息 */}
          {application.reviewNotes && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-1">审核备注</h4>
              <p className="text-gray-700">{application.reviewNotes}</p>
              {application.reviewedAt && (
                <p className="text-sm text-gray-500 mt-1">
                  审核时间：{new Date(application.reviewedAt).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* 体检信息 */}
          {application.medicalCheckDate && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-1">体检安排</h4>
              <p className="text-gray-700">
                体检时间：{new Date(application.medicalCheckDate).toLocaleString()}
              </p>
              {application.medicalCheckNotes && (
                <p className="text-gray-700 mt-1">{application.medicalCheckNotes}</p>
              )}
            </div>
          )}

          {/* 入组信息 */}
          {application.enrollmentDate && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-1">入组信息</h4>
              <p className="text-gray-700">
                入组时间：{new Date(application.enrollmentDate).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* 试验信息 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">试验项目</h2>
          <div className="space-y-3">
            <div>
              <h3 className="font-medium text-gray-900">{application.trial.title}</h3>
                              <p className="text-gray-600">{application.trial.hospital}</p>
            </div>

            <div className="flex items-center text-gray-600">
              <DollarSign className="w-4 h-4 mr-2" />
              补助：¥{application.trial.compensation}
            </div>
            {application.trial.referralFee > 0 && (
              <div className="flex items-center text-gray-600">
                <Award className="w-4 h-4 mr-2" />
                推荐费：¥{application.trial.referralFee}
              </div>
            )}
          </div>
        </div>

        {/* 申请人信息 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">申请人信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-gray-600">姓名：</span>
              <span className="ml-1 text-gray-900">{application.name}</span>
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-gray-600">手机：</span>
              <span className="ml-1 text-gray-900">{application.phone}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600">性别：</span>
              <span className="ml-1 text-gray-900">{application.gender}</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600">年龄：</span>
              <span className="ml-1 text-gray-900">{application.age}岁</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600">身高：</span>
              <span className="ml-1 text-gray-900">{application.height}cm</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600">体重：</span>
              <span className="ml-1 text-gray-900">{application.weight}kg</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600">BMI：</span>
              <span className="ml-1 text-gray-900">{application.bmi}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-gray-600">申请时间：</span>
              <span className="ml-1 text-gray-900">
                {new Date(application.submittedAt).toLocaleString()}
              </span>
            </div>
          </div>

          {/* 医疗信息 */}
          {(application.medicalHistory || application.currentMedications || application.allergies) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3">医疗信息</h3>
              <div className="space-y-3">
                {application.medicalHistory && (
                  <div>
                    <span className="text-gray-600">病史：</span>
                    <p className="ml-1 text-gray-900">{application.medicalHistory}</p>
                  </div>
                )}
                {application.currentMedications && (
                  <div>
                    <span className="text-gray-600">当前用药：</span>
                    <p className="ml-1 text-gray-900">{application.currentMedications}</p>
                  </div>
                )}
                {application.allergies && (
                  <div>
                    <span className="text-gray-600">过敏史：</span>
                    <p className="ml-1 text-gray-900">{application.allergies}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 推荐信息 */}
        {application.referrer && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">推荐信息</h2>
            <div className="space-y-2">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-gray-600">推荐人：</span>
                <span className="ml-1 text-gray-900">{application.referrer.name}</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-gray-600">推荐码：</span>
                <span className="ml-1 text-gray-900">{application.referrer.channelId}</span>
              </div>
              {application.referralFeeAmount > 0 && (
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-gray-600">推荐费：</span>
                  <span className="ml-1 text-gray-900">¥{application.referralFeeAmount}</span>
                  {application.referralFeePaid && (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded">已发放</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationDetail; 