import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Check, 
  AlertTriangle, 
  Share2, 
  Copy,
  Heart,
  Activity,
  Scale,
  Ruler,
  Phone,
  Cigarette,
  AlertCircle,
  Info,
  Award,
  Building2,
  Clock,
  MessageCircle,
  QrCode,
  X
} from 'lucide-react';
import { trialsAPI, applicationsAPI } from '../services/api';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';

// 常见疾病列表
const COMMON_DISEASES = [
  '高血压', '糖尿病', '高血脂', '冠心病', '脑血管病',
  '肝病', '肾病', '甲状腺疾病', '哮喘', '慢性阻塞性肺疾病',
  '胃病', '肠病', '关节炎', '骨质疏松', '抑郁症',
  '焦虑症', '失眠', '癫痫', '偏头痛', '过敏性疾病'
];

const Apply = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [trial, setTrial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showReferralLink, setShowReferralLink] = useState(false);
  const [eligibilityStatus, setEligibilityStatus] = useState(null);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [showWechatQR, setShowWechatQR] = useState(false);
  const { user, updateProfile, isAuthenticated } = useAuthStore();
  
  // 获取推荐码
  const channelId = searchParams.get('ref');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: isAuthenticated ? (user?.name || '') : '',
      phone: isAuthenticated ? (user?.phone || '') : '',
      idCard: isAuthenticated ? (user?.idCard || '') : '',
      gender: isAuthenticated ? (user?.gender || '') : '',
      height: isAuthenticated ? (user?.height || '') : '',
      weight: isAuthenticated ? (user?.weight || '') : '',
      smokingStatus: isAuthenticated ? (user?.smokingStatus || '不吸烟') : '不吸烟',
      diseases: isAuthenticated ? (user?.diseases || []) : [],
      medicalHistory: isAuthenticated ? (user?.medicalHistory || '') : '',
      currentMedications: isAuthenticated ? (user?.currentMedications || '') : '',
      allergies: isAuthenticated ? (user?.allergies || '') : '',
    }
  });

  // 监听字段变化
  const height = watch('height');
  const weight = watch('weight');
  const idCard = watch('idCard');
  const gender = watch('gender');
  const selectedDiseases = watch('diseases');

  // 计算BMI
  const calculateBMI = () => {
    if (height && weight) {
      const heightInMeters = height / 100;
      return (weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return null;
  };

  // 计算年龄和性别
  const calculateAgeAndGender = () => {
    if (idCard && idCard.length >= 14) {
      const year = parseInt(idCard.substring(6, 10));
      const month = parseInt(idCard.substring(10, 12));
      const day = parseInt(idCard.substring(12, 14));
      const birthday = new Date(year, month - 1, day);
      const today = new Date();
      let age = today.getFullYear() - birthday.getFullYear();
      const monthDiff = today.getMonth() - birthday.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
        age--;
      }
      
      // 从身份证号获取性别
      const genderCode = parseInt(idCard.substring(16, 17));
      const calculatedGender = genderCode % 2 === 0 ? '女' : '男';
      
      // 自动设置性别
      if (calculatedGender !== gender) {
        setValue('gender', calculatedGender);
      }
      
      return { age, gender: calculatedGender };
    }
    return { age: null, gender: null };
  };

  // 检查是否符合试验要求
  const checkEligibility = () => {
    if (!trial || !height || !weight) return null;
    
    const bmi = parseFloat(calculateBMI());
    const { age } = calculateAgeAndGender();
    
    const issues = [];
    
    // 检查年龄
    if (age !== null && trial.minAge && age < trial.minAge) {
      issues.push(`年龄需≥${trial.minAge}岁`);
    }
    if (age !== null && trial.maxAge && age > trial.maxAge) {
      issues.push(`年龄需≤${trial.maxAge}岁`);
    }
    
    // 检查BMI
    if (trial.minBmi && bmi < trial.minBmi) {
      issues.push(`BMI需≥${trial.minBmi}`);
    }
    if (trial.maxBmi && bmi > trial.maxBmi) {
      issues.push(`BMI需≤${trial.maxBmi}`);
    }
    
    // 检查性别
    if (trial.genderRequirement && trial.genderRequirement !== '不限' && gender !== trial.genderRequirement) {
      issues.push(`性别需为${trial.genderRequirement}`);
    }
    
    return {
      eligible: issues.length === 0,
      issues
    };
  };

  // 生成推荐链接
  const generateReferralLink = () => {
    if (!user?.channelId) return '';
    return `${window.location.origin}/trial/${id}?ref=${user.channelId}`;
  };

  // 复制推荐链接
  const copyReferralLink = async () => {
    const link = generateReferralLink();
    try {
      await navigator.clipboard.writeText(link);
      toast.success('推荐链接已复制');
    } catch (error) {
      toast.error('复制失败');
    }
  };

  useEffect(() => {
    fetchTrialDetail();
  }, [id]);

  useEffect(() => {
    const eligibility = checkEligibility();
    setEligibilityStatus(eligibility);
  }, [trial, height, weight, idCard, gender]);

  const fetchTrialDetail = async () => {
    try {
      const response = await trialsAPI.getTrialById(id);
      setTrial(response.data.trial);
    } catch (error) {
      toast.error('获取试验详情失败');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      // 检查资格
      const eligibility = checkEligibility();
      if (eligibility && !eligibility.eligible) {
        toast.error('抱歉，您不符合本试验的入选条件');
        setSubmitting(false);
        return;
      }

      // 计算相关信息
      const bmi = calculateBMI();
      const { age, gender: calculatedGender } = calculateAgeAndGender();

      // 准备提交数据
      const submitData = {
        ...data,
        gender: calculatedGender,
        age,
        bmi: parseFloat(bmi),
        birthday: idCard ? new Date(
          parseInt(idCard.substring(6, 10)),
          parseInt(idCard.substring(10, 12)) - 1,
          parseInt(idCard.substring(12, 14))
        ) : null,
        trialId: id,
        channelId: channelId // 添加推荐码
      };

      // 如果用户已登录，先更新用户信息
      if (isAuthenticated) {
        await updateProfile(submitData);
        // 使用认证的申请接口
        await applicationsAPI.apply(id, submitData);
      } else {
        // 使用公开的申请接口
        await applicationsAPI.applyPublic(id, submitData);
      }
      
      // 显示成功页面，不再直接跳转
      setApplicationSuccess(true);
      toast.success('报名成功！');
    } catch (error) {
      // 错误已在API层处理
    } finally {
      setSubmitting(false);
    }
  };

  const bmi = calculateBMI();
  const { age } = calculateAgeAndGender();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <span className="text-gray-600">加载中...</span>
        </div>
      </div>
    );
  }

  if (!trial) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">试验项目未找到</h1>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  // 报名成功页面
  if (applicationSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            {/* 成功图标 */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            {/* 标题 */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">报名成功！</h1>
            
            {/* 状态提示 */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center text-orange-700 mb-2">
                <Clock className="w-5 h-5 mr-2" />
                <span className="font-semibold">已报名，正在审核中</span>
              </div>
              <p className="text-sm text-orange-600">
                我们已收到您的报名申请，工作人员将在1-2个工作日内联系您
              </p>
            </div>
            
            {/* 重要提示 */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center text-red-700 mb-2">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span className="font-bold">务必添加客服微信</span>
              </div>
              <p className="text-sm text-red-600 mb-3">
                为确保及时沟通试验进展，请务必添加客服微信
              </p>
              <button
                onClick={() => setShowWechatQR(true)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                添加客服微信
              </button>
            </div>
            
            {/* 试验信息 */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">{trial.title}</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">医院:</span> {trial.hospital}</p>
                <p><span className="font-medium">疾病:</span> {trial.disease}</p>
                <p><span className="font-medium">补贴:</span> ¥{trial.compensation}</p>
              </div>
            </div>
            
            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-3">
              {isAuthenticated && (
                <button
                  onClick={() => navigate('/applications')}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  查看我的申请
                </button>
              )}
              <button
                onClick={() => navigate('/')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                返回首页
              </button>
            </div>
          </div>
        </div>
        
        {/* 微信二维码弹窗 */}
        {showWechatQR && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">添加客服微信</h3>
                <button
                  onClick={() => setShowWechatQR(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="text-center">
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                  <img 
                    src="/wechat-qr.png" 
                    alt="客服微信二维码" 
                    className="w-48 h-48 mx-auto"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div style={{display: 'none'}} className="w-48 h-48 mx-auto bg-gray-200 flex items-center justify-center text-gray-500">
                    <QrCode className="w-16 h-16" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">扫码添加客服微信</p>
                <p className="text-xs text-gray-500">微信号: clinical-service</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 标题区域 */}
        <div className="mb-8">
          {/* 未登录用户提示 */}
          {!isAuthenticated && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">温馨提示</p>
                  <p>您可以直接填写表单进行报名申请。如需享受推荐服务或查看申请记录，请先 
                    <Link to="/register" className="text-blue-600 underline mx-1">注册账号</Link>
                    或 
                    <Link to="/login" className="text-blue-600 underline ml-1">登录</Link>
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">报名申请</h1>
              <div className="flex items-center text-gray-600 mb-4">
                <Activity className="w-5 h-5 mr-2" />
                <span className="font-medium">{trial.title}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Building2 className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <div className="text-sm text-gray-500">医疗机构</div>
                  <div className="font-medium text-gray-900">{trial.hospital}</div>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Award className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <div className="text-sm text-gray-500">试验补贴</div>
                  <div className="font-medium text-gray-900">¥{trial.compensation}</div>
                </div>
              </div>
              {isAuthenticated && trial.referralFee > 0 && (
                <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Share2 className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <div className="text-sm text-blue-600">推荐奖励</div>
                    <div className="font-medium text-blue-700">¥{trial.referralFee}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 基本信息 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-gray-500" />
              基本信息
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  姓名 *
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="请输入真实姓名"
                  className="input"
                  {...register('name', {
                    required: '请输入姓名',
                    minLength: { value: 2, message: '姓名至少2个字符' }
                  })}
                />
                {errors.name && (
                  <p className="form-error">{errors.name.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  手机号 *
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="请输入手机号"
                  className={`input ${isAuthenticated ? 'bg-gray-50' : ''}`}
                  disabled={isAuthenticated}
                  {...register('phone', {
                    required: '请输入手机号',
                    pattern: {
                      value: /^1[3-9]\d{9}$/,
                      message: '请输入有效的手机号码'
                    }
                  })}
                />
                {isAuthenticated && (
                  <p className="text-xs text-gray-500 mt-1">手机号不可修改</p>
                )}
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="idCard" className="form-label">
                  身份证号 *
                </label>
                <input
                  id="idCard"
                  type="text"
                  placeholder="请输入身份证号"
                  className="input"
                  {...register('idCard', {
                    required: '请输入身份证号',
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
                <label htmlFor="gender" className="form-label">
                  性别 *
                </label>
                <select
                  id="gender"
                  className="input"
                  {...register('gender', { required: '请选择性别' })}
                >
                  <option value="">请选择性别</option>
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
                {errors.gender && (
                  <p className="form-error">{errors.gender.message}</p>
                )}
                {idCard && gender && (
                  <p className="text-xs text-green-600 mt-1">
                    已从身份证自动识别
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 身体信息 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Scale className="w-5 h-5 mr-2 text-gray-500" />
              身体信息
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label htmlFor="height" className="form-label flex items-center">
                  <Ruler className="w-4 h-4 mr-1" />
                  身高 (cm) *
                </label>
                <input
                  id="height"
                  type="number"
                  placeholder="请输入身高"
                  className="input"
                  {...register('height', {
                    required: '请输入身高',
                    min: { value: 100, message: '身高不能小于100cm' },
                    max: { value: 250, message: '身高不能大于250cm' }
                  })}
                />
                {errors.height && (
                  <p className="form-error">{errors.height.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="weight" className="form-label flex items-center">
                  <Scale className="w-4 h-4 mr-1" />
                  体重 (kg) *
                </label>
                <input
                  id="weight"
                  type="number"
                  placeholder="请输入体重"
                  className="input"
                  {...register('weight', {
                    required: '请输入体重',
                    min: { value: 30, message: '体重不能小于30kg' },
                    max: { value: 200, message: '体重不能大于200kg' }
                  })}
                />
                {errors.weight && (
                  <p className="form-error">{errors.weight.message}</p>
                )}
              </div>
            </div>

            {/* 自动计算信息 */}
            {(bmi || age) && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">自动计算信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {age && (
                    <div className="flex items-center text-gray-700">
                      <User className="w-4 h-4 mr-2 text-gray-500" />
                      <span>年龄: <strong>{age}岁</strong></span>
                    </div>
                  )}
                  {bmi && (
                    <div className="flex items-center text-gray-700">
                      <Activity className="w-4 h-4 mr-2 text-gray-500" />
                      <span>BMI: <strong>{bmi}</strong></span>
                    </div>
                  )}
                  {bmi && (
                    <div className="flex items-center text-gray-700">
                      <Heart className="w-4 h-4 mr-2 text-gray-500" />
                      <span>
                        {bmi < 18.5 ? '偏瘦' : 
                         bmi < 24 ? '正常' : 
                         bmi < 28 ? '偏胖' : '肥胖'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 资格检查 */}
            {eligibilityStatus && (
              <div className={`mt-4 p-4 rounded-lg border ${
                eligibilityStatus.eligible 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start">
                  {eligibilityStatus.eligible ? (
                    <Check className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <p className={`font-medium ${
                      eligibilityStatus.eligible ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {eligibilityStatus.eligible ? '✅ 符合试验要求' : '❌ 不符合试验要求'}
                    </p>
                    {!eligibilityStatus.eligible && (
                      <ul className="mt-2 text-sm text-red-700">
                        {eligibilityStatus.issues.map((issue, index) => (
                          <li key={index} className="list-disc list-inside">{issue}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>



          {/* 健康信息 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-gray-500" />
              健康信息
            </h2>

            <div className="space-y-6">
              {/* 吸烟状态 */}
              <div className="form-group">
                <label htmlFor="smokingStatus" className="form-label flex items-center">
                  <Cigarette className="w-4 h-4 mr-1" />
                  吸烟状态 *
                </label>
                <select
                  id="smokingStatus"
                  className="input"
                  {...register('smokingStatus', { required: '请选择吸烟状态' })}
                >
                  <option value="不吸烟">不吸烟</option>
                  <option value="偶尔吸烟">偶尔吸烟</option>
                  <option value="经常吸烟">经常吸烟</option>
                  <option value="已戒烟">已戒烟</option>
                </select>
                {errors.smokingStatus && (
                  <p className="form-error">{errors.smokingStatus.message}</p>
                )}
              </div>

              {/* 疾病史 */}
              <div className="form-group">
                <label className="form-label flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  疾病史（请选择您曾经或正在患有的疾病，如无疾病史可不选择）
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
                  {COMMON_DISEASES.map((disease) => (
                    <label key={disease} className="flex items-center">
                      <input
                        type="checkbox"
                        value={disease}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        {...register('diseases')}
                      />
                      <span className="ml-2 text-sm text-gray-700">{disease}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">如有其他疾病，请在下方详细说明；如无疾病史，可在详细病史中填写"无"</p>
              </div>

              {/* 详细医疗信息 */}
              <div className="grid grid-cols-1 gap-6">
                <div className="form-group">
                  <label htmlFor="medicalHistory" className="form-label">
                    详细病史及手术史（如无相关病史，请填写"无"）
                  </label>
                  <textarea
                    id="medicalHistory"
                    rows={3}
                    placeholder="请详细描述您的病史、手术史等医疗信息，如无病史请填写'无'"
                    className="input"
                    {...register('medicalHistory')}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="currentMedications" className="form-label">
                    当前用药情况（如无用药，请填写"无"）
                  </label>
                  <textarea
                    id="currentMedications"
                    rows={3}
                    placeholder="请列出您目前正在服用的所有药物，如无用药请填写'无'"
                    className="input"
                    {...register('currentMedications')}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="allergies" className="form-label">
                    过敏史（如无过敏史，请填写"无"）
                  </label>
                  <textarea
                    id="allergies"
                    rows={2}
                    placeholder="请说明您对哪些药物、食物或其他物质过敏，如无过敏史请填写'无'"
                    className="input"
                    {...register('allergies')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 推荐功能 */}
          {isAuthenticated && user?.channelId && trial.referralFee > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Share2 className="w-5 h-5 mr-2 text-gray-500" />
                推荐给他人
              </h2>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-blue-900 mb-2">
                      推荐奖励：¥{trial.referralFee}
                    </h3>
                    <p className="text-sm text-blue-700 mb-3">
                      推荐朋友参与此试验，成功入组后您可获得推荐奖励
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowReferralLink(!showReferralLink)}
                      className="px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                    >
                      {showReferralLink ? '隐藏' : '生成'}推荐链接
                    </button>
                  </div>
                  <Share2 className="w-8 h-8 text-blue-600" />
                </div>
                
                {showReferralLink && (
                  <div className="mt-4 p-3 bg-white rounded border">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={generateReferralLink()}
                        readOnly
                        className="input flex-1 text-sm"
                      />
                      <button
                        type="button"
                        onClick={copyReferralLink}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        复制
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      分享此链接给朋友，他们通过此链接报名成功后您将获得奖励
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 授权同意 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Check className="w-5 h-5 mr-2 text-gray-500" />
              授权同意
            </h2>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-orange-800">
                  <p className="font-medium mb-2">重要声明</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>我同意将个人信息提供给医疗机构用于临床试验筛选</li>
                    <li>我同意接受相关的医疗咨询、检查和随访</li>
                    <li>我了解参与临床试验的风险和收益</li>
                    <li>我明白可以随时退出试验，且不会影响正常医疗</li>
                    <li>我确认以上信息真实有效，如有虚假愿承担相应责任</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex-1"
              >
                返回
              </button>
              <button
                type="submit"
                disabled={submitting || (eligibilityStatus && !eligibilityStatus.eligible)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex-1"
              >
                {submitting ? (
                  <div className="flex items-center justify-center">
                    <div className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    提交中...
                  </div>
                ) : (
                  '提交申请'
                )}
              </button>
            </div>
            
            {eligibilityStatus && !eligibilityStatus.eligible && (
              <p className="text-sm text-red-600 text-center mt-3">
                请先满足试验入选条件后再提交申请
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Apply; 