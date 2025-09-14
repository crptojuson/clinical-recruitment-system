import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, User, Check } from 'lucide-react';
import useAuthStore from '../stores/authStore';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [referrer, setReferrer] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const channelId = searchParams.get('channel');

  const { register: registerUser, isLoading, validateChannelId } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  // 监听身高体重变化，自动计算BMI
  const height = watch('height');
  const weight = watch('weight');
  
  const calculateBMI = () => {
    if (height && weight) {
      const heightInMeters = height / 100;
      return (weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return null;
  };

  // 验证推荐码
  useEffect(() => {
    if (channelId) {
      validateChannelId(channelId).then(result => {
        if (result.success) {
          setReferrer(result.agent);
        }
      });
    }
  }, [channelId, validateChannelId]);

  const onSubmit = async (data) => {
    const userData = {
      ...data,
      channelId: channelId || undefined
    };

    const result = await registerUser(userData);
    if (result.success) {
      navigate('/');
    }
  };

  const bmi = calculateBMI();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">试</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            创建您的账户
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            已有账户？
            <Link
              to="/login"
              className="ml-1 font-medium text-primary-600 hover:text-primary-500"
            >
              立即登录
            </Link>
          </p>

          {/* 推荐信息显示 */}
          {referrer && (
            <div className="mt-4 p-3 bg-success-50 border border-success-200 rounded-lg">
              <div className="flex items-center">
                <Check className="w-5 h-5 text-success-600 mr-2" />
                <span className="text-sm text-success-800">
                  由 <strong>{referrer.name}</strong> 推荐注册
                </span>
              </div>
            </div>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* 基本信息 */}
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
                  minLength: {
                    value: 2,
                    message: '姓名至少2个字符'
                  }
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
                className="input"
                {...register('phone', {
                  required: '请输入手机号',
                  pattern: {
                    value: /^1[3-9]\d{9}$/,
                    message: '请输入有效的手机号'
                  }
                })}
              />
              {errors.phone && (
                <p className="form-error">{errors.phone.message}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                密码 *
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="请设置密码（至少6位）"
                  className="input pr-10"
                  {...register('password', {
                    required: '请设置密码',
                    minLength: {
                      value: 6,
                      message: '密码至少6位'
                    }
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
              )}
            </div>

            {/* 身份信息 */}
            <div className="form-group">
              <label htmlFor="idCard" className="form-label">
                身份证号
              </label>
              <input
                id="idCard"
                type="text"
                placeholder="请输入身份证号（选填）"
                className="input"
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

            {/* 身体信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="height" className="form-label">
                  身高 (cm)
                </label>
                <input
                  id="height"
                  type="number"
                  placeholder="身高"
                  className="input"
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
                <label htmlFor="weight" className="form-label">
                  体重 (kg)
                </label>
                <input
                  id="weight"
                  type="number"
                  placeholder="体重"
                  className="input"
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
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <User className="w-4 h-4 text-gray-600 mr-2" />
                  <span className="text-sm text-gray-700">
                    BMI: <strong>{bmi}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner mr-2"></div>
                  注册中...
                </div>
              ) : (
                '创建账户'
              )}
            </button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              注册即表示您同意我们的
              <a href="#" className="text-primary-600 hover:text-primary-500">
                服务条款
              </a>
              和
              <a href="#" className="text-primary-600 hover:text-primary-500">
                隐私政策
              </a>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register; 