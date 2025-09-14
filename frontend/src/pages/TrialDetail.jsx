import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, Share2, Calendar, Building, Award, Info, Heart, AlertCircle, MessageCircle, QrCode, X } from 'lucide-react';
import { trialsAPI } from '../services/api';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';

const TrialDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trial, setTrial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWechatQR, setShowWechatQR] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const { isAuthenticated, user, isAgent } = useAuthStore();

  useEffect(() => {
    fetchTrialDetail();
  }, [id]);

  const fetchTrialDetail = async () => {
    try {
      const response = await trialsAPI.getTrialById(id);
      setTrial(response.data.trial);
    } catch (error) {
      toast.error('获取试验详情失败');
    } finally {
      setLoading(false);
    }
  };

  // 检查报名时间状态
  const now = new Date();
  const isRegistrationNotStarted = trial?.registrationStartDate && now < new Date(trial.registrationStartDate);
  const isRegistrationExpired = trial?.registrationDeadline && now > new Date(trial.registrationDeadline);
  const isTrialCompleted = trial?.endDate && now > new Date(trial.endDate);

  const handleApply = () => {
    if (isRegistrationNotStarted) {
      toast.error('报名尚未开始');
      return;
    }
    if (isRegistrationExpired || isTrialCompleted) {
      toast.error(isTrialCompleted ? '试验已结束，无法报名' : '报名已截止');
      return;
    }
    // 直接跳转到报名页面，无论是否登录
    navigate(`/apply/${id}`);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const copyShareLink = () => {
    const referralCode = user.channelId || user.id;
    const shareUrl = `${window.location.origin}/trial/${id}?ref=${referralCode}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('推荐链接已复制到剪贴板');
  };

  const handleWechatContact = () => {
    // 检测是否在微信内置浏览器
    const isWechat = /MicroMessenger/i.test(navigator.userAgent);
    
    if (isWechat) {
      // 在微信内，显示二维码
      setShowWechatQR(true);
    } else {
      // 尝试URL scheme直接打开微信
      const wechatScheme = `weixin://`;
      
      // 创建隐藏的链接并尝试打开
      const link = document.createElement('a');
      link.href = wechatScheme;
      
      // 检测是否成功打开微信
      let timeout = setTimeout(() => {
        // 如果没有成功打开微信，复制微信号
        navigator.clipboard.writeText(trial.contactPhone);
        toast.success('微信号已复制到剪贴板，请在微信中搜索添加');
      }, 1000);
      
      // 尝试打开微信
      try {
        link.click();
        // 如果成功，显示提示
        toast.success('正在打开微信...');
        clearTimeout(timeout);
      } catch (error) {
        // 失败则复制微信号
        clearTimeout(timeout);
        navigator.clipboard.writeText(trial.contactPhone);
        toast.success('微信号已复制到剪贴板，请在微信中搜索添加');
      }
    }
  };

  const handleViewMap = () => {
    if (!trial.location) return;
    
    // 构建高德地图URL
    const mapUrl = `https://uri.amap.com/marker?position=&name=${encodeURIComponent(trial.hospital)}&address=${encodeURIComponent(trial.location)}&src=myapp`;
    
    // 在新窗口打开地图
    window.open(mapUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="loading-spinner mb-4"></div>
          <span className="text-gray-600 text-lg">加载中...</span>
        </div>
      </div>
    );
  }

  if (!trial) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-12 rounded-2xl shadow-xl">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">试验项目未找到</h1>
          <p className="text-gray-600 mb-6">抱歉，您访问的试验项目不存在或已被移除</p>
          <Link to="/" className="btn btn-primary">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 返回链接 */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors duration-200"
          >
            <span className="mr-2">←</span>
            返回试验列表
          </Link>
        </div>

        {/* 试验标题和状态 */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-8 text-white">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-4 leading-tight">{trial.title}</h1>
                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm font-medium">
                    <Heart className="w-4 h-4 mr-2" />
                    {trial.disease}
                  </span>
                  <span className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm font-medium">
                    <MapPin className="w-4 h-4 mr-2" />
                    {trial.city}
                  </span>
                  <span className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm font-medium">
                    <Users className="w-4 h-4 mr-2" />
                    {trial.participantType}
                  </span>
                  {trial.screeningSystem && (
                    <span className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm font-medium">
                      <Building className="w-4 h-4 mr-2" />
                      {trial.screeningSystem}
                    </span>
                  )}
                  {/* 状态标签 */}
                  {isTrialCompleted ? (
                    <span className="inline-flex items-center px-4 py-2 bg-gray-500 rounded-full text-sm font-medium">
                      <Clock className="w-4 h-4 mr-2" />
                      试验已结束
                    </span>
                  ) : isRegistrationExpired ? (
                    <span className="inline-flex items-center px-4 py-2 bg-red-500 rounded-full text-sm font-medium">
                      <Clock className="w-4 h-4 mr-2" />
                      报名已截止
                    </span>
                  ) : trial.status === 'recruiting' ? (
                    <span className="inline-flex items-center px-4 py-2 bg-green-500 rounded-full text-sm font-medium">
                      <Users className="w-4 h-4 mr-2" />
                      正在招募
                    </span>
                  ) : null}
                </div>
              </div>
              {isAuthenticated && trial.referralFee > 0 && (
                <div className="text-center bg-white/20 rounded-2xl p-4 ml-6">
                  <Award className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-2xl font-bold">¥{trial.referralFee}</div>
                  <div className="text-sm opacity-90">推荐费</div>
                </div>
              )}
            </div>
          </div>

          {/* 关键信息卡片 */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
                <div className="flex items-center mb-3">
                  <Award className="w-6 h-6 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-800">试验补贴</span>
                </div>
                <div className="text-2xl font-bold text-green-700">¥{trial.compensation}</div>
              </div>

              <div className={`bg-gradient-to-br p-6 rounded-2xl border ${
                isRegistrationNotStarted
                  ? 'from-yellow-50 to-yellow-100 border-yellow-200'
                  : isRegistrationExpired 
                  ? 'from-red-50 to-red-100 border-red-200' 
                  : 'from-blue-50 to-blue-100 border-blue-200'
              }`}>
                <div className="flex items-center mb-3">
                  <Calendar className={`w-6 h-6 mr-2 ${
                    isRegistrationNotStarted 
                      ? 'text-yellow-600'
                      : isRegistrationExpired 
                        ? 'text-red-600' 
                        : 'text-blue-600'
                  }`} />
                  <span className={`text-sm font-medium ${
                    isRegistrationNotStarted
                      ? 'text-yellow-800'
                      : isRegistrationExpired 
                        ? 'text-red-800' 
                        : 'text-blue-800'
                  }`}>
                    {trial.registrationStartDate || trial.registrationDeadline ? '报名时间' : '试验周期'}
                  </span>
                </div>
                <div className={`space-y-1 ${
                  isRegistrationNotStarted
                    ? 'text-yellow-700'
                    : isRegistrationExpired 
                      ? 'text-red-700' 
                      : 'text-blue-700'
                }`}>
                  {trial.registrationStartDate && (
                    <div className="text-sm">
                      <span className="font-medium">开始:</span> {new Date(trial.registrationStartDate).toLocaleDateString()}
                    </div>
                  )}
                  {trial.registrationDeadline && (
                    <div className="text-sm">
                      <span className="font-medium">截止:</span> {new Date(trial.registrationDeadline).toLocaleDateString()}
                    </div>
                  )}
                  {!trial.registrationStartDate && !trial.registrationDeadline && (
                    <div className="text-lg font-semibold">{trial.duration}</div>
                  )}
                </div>
                {isRegistrationNotStarted && (
                  <div className="text-xs text-yellow-600 mt-1">尚未开始</div>
                )}
                {isRegistrationExpired && (
                  <div className="text-xs text-red-600 mt-1">已截止</div>
                )}
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                <div className="flex items-center mb-3">
                  <Users className="w-6 h-6 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-purple-800">已参与人数</span>
                </div>
                <div className="text-lg font-semibold text-purple-700">
                  {trial.currentSubjects || 0}人
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200">
                <div className="flex items-center mb-3">
                  <Building className="w-6 h-6 text-orange-600 mr-2" />
                  <span className="text-sm font-medium text-orange-800">试验机构</span>
                </div>
                <div className="text-lg font-semibold text-orange-700">{trial.hospital}</div>
                {trial.location && (
                  <div className="mt-2 flex items-center">
                    <MapPin className="w-4 h-4 text-orange-600 mr-2" />
                    <span className="text-sm text-orange-700">{trial.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 试验描述 */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">试验介绍</h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                {trial.description}
              </p>
            </div>
          </div>
        </div>

        {/* 详细信息 - 单列布局 */}
        <div className="space-y-8 mb-8">
          {/* 关键要点 */}
          {trial.keyPoints && trial.keyPoints.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <Info className="w-6 h-6 text-primary-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">关键要点</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trial.keyPoints.map((point, index) => (
                  <div key={index} className="flex items-start bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 leading-relaxed">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 入组要求 */}
          {trial.requirements && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">入组要求</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="font-bold text-blue-900 mb-4 text-lg">基本条件</h3>
                  <ul className="space-y-3 text-blue-800">
                    {trial.minAge && trial.maxAge && (
                      <li className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        年龄: {trial.minAge}-{trial.maxAge}岁
                      </li>
                    )}
                    {trial.genderRequirement && trial.genderRequirement !== '不限' && (
                      <li className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        性别: {trial.genderRequirement}
                      </li>
                    )}
                    {trial.minBmi && trial.maxBmi && (
                      <li className="flex items-center">
                        <Heart className="w-4 h-4 mr-2" />
                        BMI: {trial.minBmi}-{trial.maxBmi}
                      </li>
                    )}
                  </ul>
                </div>
                
                <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                  <h3 className="font-bold text-green-900 mb-4 text-lg">详细要求</h3>
                  <div className="text-green-800 whitespace-pre-line leading-relaxed">
                    {trial.requirements}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 详情信息 */}
          {trial.exclusionCriteria && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <Info className="w-6 h-6 text-primary-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">详情</h2>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {trial.exclusionCriteria}
                </div>
              </div>
            </div>
          )}

          {/* 入院说明 */}
          {trial.admissionNotes && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">入院说明</h2>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {trial.admissionNotes}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 联系方式和操作按钮 - 放在最后 */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <MessageCircle className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">联系方式</h2>
          </div>
          
          {/* 微信联系 */}
          <div className="mb-8">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 overflow-hidden">
              <div className="flex items-center p-6">
                <MessageCircle className="w-8 h-8 text-green-600 mr-4" />
                <div className="flex-1">
                  <div className="text-lg font-bold text-green-800 mb-1">微信咨询</div>
                  <div className="text-green-700 text-lg font-semibold">{trial.contactPhone}</div>
                  <div className="text-green-600 text-sm mt-1">点击下方按钮添加微信</div>
                </div>
                <QrCode className="w-6 h-6 text-green-600" />
              </div>
              
              <div className="px-6 pb-6">
                <button
                  onClick={handleWechatContact}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  添加微信咨询
                </button>
              </div>
            </div>
          </div>

          {/* 地址信息 */}
          <div className="mb-8">
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
              <MapPin className="w-5 h-5 text-primary-600 mr-3 mt-0.5" />
              <div>
                      <div className="text-sm text-gray-600 font-medium mb-1">试验地址</div>
                      <div className="text-gray-900 leading-relaxed">{trial.location || trial.hospital}</div>
                    </div>
                  </div>
                  {trial.location && (
                    <button
                      onClick={handleViewMap}
                      className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      查看地图
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleApply}
              className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 ${
                isTrialCompleted || isRegistrationNotStarted || isRegistrationExpired || trial.status !== 'recruiting'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 transform hover:scale-105 shadow-lg'
              }`}
              disabled={isTrialCompleted || isRegistrationNotStarted || isRegistrationExpired || trial.status !== 'recruiting'}
            >
              {isTrialCompleted 
                ? '试验已结束' 
                : isRegistrationNotStarted
                  ? '报名尚未开始'
                : isRegistrationExpired 
                  ? '报名已截止' 
                  : trial.status !== 'recruiting' 
                    ? '暂不接受报名' 
                    : '立即报名'
              }
            </button>
            
            {isAuthenticated && isAgent() && (
              <button
                onClick={handleShare}
                className="flex-1 sm:flex-none py-4 px-6 rounded-xl font-medium text-primary-600 border-2 border-primary-200 hover:bg-primary-50 transition-all duration-200 flex items-center justify-center"
              >
                <Share2 className="w-4 h-4 mr-2" />
                分享推荐
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 微信二维码弹窗 */}
      {showWechatQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full relative">
            <button
              onClick={() => setShowWechatQR(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">扫码添加微信</h3>
              <p className="text-gray-600 mb-6">使用微信扫描下方二维码</p>
              
              {/* 这里应该放实际的微信二维码图片 */}
              <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">微信二维码</p>
                  <p className="text-xs text-gray-400 mt-1">{trial.contactPhone}</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-500">
                长按保存图片，在微信中扫码添加
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 分享推荐弹窗 */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full relative">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center">
              <Share2 className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">分享推荐</h3>
              <p className="text-gray-600 mb-6">分享此试验项目给朋友，他们通过您的链接报名后，您可以在个人中心查看推荐记录</p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-600 mb-2">您的推荐链接：</div>
                <div className="bg-white border rounded-lg p-3 text-sm font-mono text-gray-800 break-all">
                  {`${window.location.origin}/trial/${id}?ref=${user.channelId || user.id}`}
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={copyShareLink}
                  className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  复制链接
                </button>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrialDetail; 