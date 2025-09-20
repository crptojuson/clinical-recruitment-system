import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Share2, 
  Copy, 
  Star, 
  Users, 
  Calendar, 
  Phone, 
  Edit3, 
  Save,
  X,
  Trophy,
  Gift,
  Shield,
  Clock,
  ChevronRight,
  UserCheck,
  Award,
  FileText
} from 'lucide-react';
import useAuthStore from '../stores/authStore';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, becomeAgent, isLoading } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [referrals, setReferrals] = useState([]);
  const [loadingReferrals, setLoadingReferrals] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      idCard: user?.idCard || '',
      height: user?.height || '',
      weight: user?.weight || '',
    }
  });

  // 监听身高体重变化，自动计算BMI
  const height = watch('height');
  const weight = watch('weight');

  const calculateBMI = () => {
    if (height && weight) {
      const heightInMeters = height / 100;
      return (weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return user?.bmi || null;
  };

  const getBMIStatus = (bmi) => {
    if (!bmi) return { text: '未知', color: 'text-gray-500' };
    const value = parseFloat(bmi);
    if (value < 18.5) return { text: '偏瘦', color: 'text-blue-600' };
    if (value < 24) return { text: '正常', color: 'text-green-600' };
    if (value < 28) return { text: '偏胖', color: 'text-orange-600' };
    return { text: '肥胖', color: 'text-red-600' };
  };

  // 获取推荐用户列表
  const fetchReferrals = async () => {
    if (!user?.channelId) return;
    
    setLoadingReferrals(true);
    try {
      const response = await authAPI.getReferrals();
      setReferrals(response.data.referrals || []);
    } catch (error) {
      console.error('获取推荐列表失败:', error);
    } finally {
      setLoadingReferrals(false);
    }
  };

  useEffect(() => {
    if (user?.channelId) {
      fetchReferrals();
    }
  }, [user?.channelId]);

  const onSubmit = async (data) => {
    const result = await updateProfile(data);
    if (result.success) {
      setIsEditing(false);
    }
  };

  const handleBecomeAgent = async () => {
    const result = await becomeAgent();
    if (result.success) {
      toast.success(`您的推荐码：${result.channelId}`);
    }
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/register?channel=${user.channelId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('推荐链接已复制到剪贴板');
  };

  const bmi = calculateBMI();
  const bmiStatus = getBMIStatus(bmi);

  const getRoleInfo = (role) => {
    switch (role) {
      case 'admin':
        return { text: '系统管理员', icon: Shield, bgColor: 'bg-gray-100', textColor: 'text-gray-700' };
      case 'agent':
        return { text: '代理用户', icon: Award, bgColor: 'bg-blue-50', textColor: 'text-blue-700' };
      default:
        return { text: '普通用户', icon: User, bgColor: 'bg-gray-100', textColor: 'text-gray-700' };
    }
  };

  const roleInfo = getRoleInfo(user?.role);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">个人中心</h1>
              <p className="text-gray-600">管理您的个人信息和账户设置</p>
            </div>
            <div className="hidden sm:flex items-center space-x-4">
              <div className={`flex items-center px-3 py-2 ${roleInfo.bgColor} rounded-lg`}>
                <roleInfo.icon className={`w-5 h-5 mr-2 ${roleInfo.textColor}`} />
                <span className={`text-sm font-medium ${roleInfo.textColor}`}>{roleInfo.text}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 左侧主要内容 */}
          <div className="lg:col-span-3 space-y-8">
            {/* 基本信息卡片 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="ml-4">
                      <h2 className="text-xl font-semibold text-gray-900">基本信息</h2>
                      <p className="text-sm text-gray-500">完善个人资料，获得更好的服务体验</p>
                    </div>
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      编辑信息
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          reset();
                        }}
                        className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <X className="w-4 h-4 mr-2" />
                        取消
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label className="form-label flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        姓名
                      </label>
                      <input
                        type="text"
                        className={`input ${isEditing ? 'ring-2 ring-blue-500 border-blue-300' : 'bg-gray-50'}`}
                        disabled={!isEditing}
                        {...register('name', {
                          required: '请输入姓名'
                        })}
                      />
                      {errors.name && (
                        <p className="form-error">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        手机号
                      </label>
                      <input
                        type="tel"
                        value={user?.phone || ''}
                        className="input bg-gray-50"
                        disabled
                      />
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <Shield className="w-3 h-3 mr-1" />
                        手机号不可修改，用于账户安全
                      </p>
                    </div>

                    <div className="form-group">
                      <label className="form-label">身份证号</label>
                      <input
                        type="text"
                        className={`input ${isEditing ? 'ring-2 ring-blue-500 border-blue-300' : 'bg-gray-50'}`}
                        disabled={!isEditing}
                        placeholder={isEditing ? "请输入18位身份证号" : ""}
                        {...register('idCard', {
                          pattern: {
                            value: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/,
                            message: '请输入有效的身份证号'
                          }
                        })}
                      />
                      {errors.idCard && (
                        <p className="form-error">{errors.idCard.message}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        年龄
                      </label>
                      <input
                        type="text"
                        value={user?.age ? `${user.age}岁` : '未设置'}
                        className="input bg-gray-50"
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1">年龄由身份证号自动计算</p>
                    </div>

                    <div className="form-group">
                      <label className="form-label">身高 (cm)</label>
                      <input
                        type="number"
                        className={`input ${isEditing ? 'ring-2 ring-blue-500 border-blue-300' : 'bg-gray-50'}`}
                        disabled={!isEditing}
                        placeholder={isEditing ? "请输入身高" : ""}
                        {...register('height', {
                          min: {
                            value: 100,
                            message: '身高不能小于100cm'
                          },
                          max: {
                            value: 250,
                            message: '身高不能大于250cm'
                          }
                        })}
                      />
                      {errors.height && (
                        <p className="form-error">{errors.height.message}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">体重 (kg)</label>
                      <input
                        type="number"
                        className={`input ${isEditing ? 'ring-2 ring-blue-500 border-blue-300' : 'bg-gray-50'}`}
                        disabled={!isEditing}
                        placeholder={isEditing ? "请输入体重" : ""}
                        {...register('weight', {
                          min: {
                            value: 30,
                            message: '体重不能小于30kg'
                          },
                          max: {
                            value: 200,
                            message: '体重不能大于200kg'
                          }
                        })}
                      />
                      {errors.weight && (
                        <p className="form-error">{errors.weight.message}</p>
                      )}
                    </div>
                  </div>

                  {/* BMI显示 */}
                  {bmi && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="p-2 bg-white rounded-lg mr-3 border">
                            <Trophy className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">BMI指数</div>
                            <div className="text-sm text-gray-500">身体质量指数</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{bmi}</div>
                          <div className={`text-sm font-medium ${bmiStatus.color}`}>
                            {bmiStatus.text}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {isEditing && (
                    <div className="flex justify-end pt-4 border-t border-gray-200">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isLoading ? '保存中...' : '保存更改'}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* 推荐用户列表 */}
            {(user?.role === 'agent' || user?.role === 'admin') && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-5 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Users className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <h2 className="text-xl font-semibold text-gray-900">我的推荐用户</h2>
                        <p className="text-sm text-gray-500">通过您推荐注册的用户列表</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-3 py-1 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        共 {referrals.length} 人
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {loadingReferrals ? (
                    <div className="text-center py-12">
                      <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-gray-500">加载推荐用户中...</p>
                    </div>
                  ) : referrals.length > 0 ? (
                    <div className="space-y-4">
                      {referrals.map((referral, index) => (
                        <div key={referral.id || index} className="group bg-gray-50 rounded-lg p-4 hover:bg-white hover:shadow-sm border hover:border-gray-300 transition-all duration-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-3">
                                <div className="p-1.5 bg-white rounded-lg mr-3 border">
                                  <UserCheck className="w-4 h-4 text-gray-600" />
                                </div>
                                <span className="font-medium text-gray-900">
                                  {referral.name || '未填写姓名'}
                                </span>
                                {referral.status && (
                                  <span className={`ml-3 px-2.5 py-1 rounded-full text-xs font-medium ${
                                    referral.status === 'enrolled' ? 'bg-green-100 text-green-800' :
                                    referral.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                                    referral.status === 'submitted' ? 'bg-orange-100 text-orange-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {referral.status === 'enrolled' ? '已入组' :
                                     referral.status === 'contacted' ? '已联系' :
                                     referral.status === 'submitted' ? '已提交' : '待处理'}
                                  </span>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                                {referral.phone && (
                                  <div className="flex items-center">
                                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                    <span>{referral.phone}</span>
                                  </div>
                                )}
                                {referral.appliedAt && (
                                  <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                    <span>{new Date(referral.appliedAt).toLocaleDateString()}</span>
                                  </div>
                                )}
                                {referral.trialTitle && (
                                  <div className="md:col-span-2 p-2 bg-white rounded border border-gray-200">
                                    <span className="text-xs text-gray-500">参与项目：</span>
                                    <div className="font-medium text-gray-700">{referral.trialTitle}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">暂无推荐用户</h3>
                      <p className="text-gray-500 mb-4">
                        分享项目链接给朋友，他们注册后会显示在这里
                      </p>
                      <button
                        onClick={copyShareLink}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        分享推荐链接
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 右侧边栏 */}
          <div className="space-y-6">
            {/* 账户信息卡片 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-gray-500" />
                  账户信息
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <roleInfo.icon className={`w-5 h-5 mr-3 ${roleInfo.textColor}`} />
                    <div>
                      <div className="font-medium text-gray-900">{roleInfo.text}</div>
                      <div className="text-xs text-gray-500">账户类型</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 mr-3 text-gray-500" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {new Date(user?.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">注册时间</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 推荐功能卡片 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Gift className="w-5 h-5 mr-2 text-gray-500" />
                  推荐奖励
                </h3>
              </div>
              
              <div className="p-5">
                {user?.role === 'agent' || user?.role === 'admin' ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center mb-3">
                        <div className="p-1.5 bg-blue-100 rounded-lg mr-3">
                          <Star className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="font-medium text-blue-800">代理特权已激活</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">推荐码</span>
                          <code className="bg-white px-2 py-1 rounded border text-blue-700 font-mono">
                            {user.channelId}
                          </code>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">累计收益</span>
                          <span className="font-semibold text-green-600">¥{user.totalEarnings || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">推荐人数</span>
                          <span className="font-semibold text-blue-600">{user.referralCount || 0}人</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded-lg text-center border">
                        <div className="text-2xl font-bold text-gray-900">{user.totalReferrals || 0}</div>
                        <div className="text-xs text-gray-600">推荐人数</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg text-center border">
                        <div className="text-2xl font-bold text-gray-900">¥{user.totalEarnings || 0}</div>
                        <div className="text-xs text-gray-600">累计收益</div>
                      </div>
                    </div>

                    <button
                      onClick={copyShareLink}
                      className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      复制推荐链接
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Gift className="w-6 h-6 text-gray-500" />
                      </div>
                      <h4 className="font-medium text-gray-900 mb-2">成为推荐代理</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        推荐朋友参与试验获得奖励
                      </p>
                    </div>
                    
                    <div className="space-y-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                        每成功推荐1人获得奖励
                      </div>
                      <div className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                        专属推荐码和链接
                      </div>
                      <div className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                        实时查看推荐收益
                      </div>
                    </div>
                    
                    <button
                      onClick={handleBecomeAgent}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <Award className="w-4 h-4 mr-2" />
                      立即成为代理
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default Profile; 