import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Plus, Trash2 } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const TrialForm = ({ trial = null, isOpen, onClose, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [inclusionCriteria, setInclusionCriteria] = useState(['']);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      disease: '',
      participantType: '',
      screeningSystem: '',
      location: '',
      city: '',
      hospital: '',
      totalSubjects: '',
      compensation: '',
      duration: '',
      referralFee: '',
      admissionNotes: '',
      registrationStartDate: '',
      registrationDeadline: ''
    }
  });

  useEffect(() => {
    if (trial) {
      // 编辑模式：填充表单
      Object.keys(trial).forEach(key => {
        setValue(key, trial[key] || '');
      });
      // 将requirements字符串转换为inclusionCriteria数组
      const requirements = trial.requirements || '';
      setInclusionCriteria(requirements ? requirements.split('\n').filter(c => c.trim()) : ['']);
    } else {
      // 添加模式：重置表单
      reset();
      setInclusionCriteria(['']);
    }
  }, [trial, setValue, reset]);

  const addCriterion = (type) => {
    if (type === 'inclusion') {
      setInclusionCriteria([...inclusionCriteria, '']);
    }
  };

  const removeCriterion = (type, index) => {
    if (type === 'inclusion') {
      setInclusionCriteria(inclusionCriteria.filter((_, i) => i !== index));
    }
  };

  const updateCriterion = (type, index, value) => {
    if (type === 'inclusion') {
      const updated = [...inclusionCriteria];
      updated[index] = value;
      setInclusionCriteria(updated);
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const submitData = {
        ...data,
        totalSubjects: data.totalSubjects ? parseInt(data.totalSubjects) : null,
        compensation: data.compensation ? parseFloat(data.compensation) : null,
        referralFee: data.referralFee ? parseFloat(data.referralFee) : null,
        // 将inclusionCriteria数组转换为requirements字符串
        requirements: inclusionCriteria.filter(c => c.trim()).join('\n')
      };

      if (trial) {
        await adminAPI.updateTrial(trial.id, submitData);
        toast.success('试验更新成功');
      } else {
        await adminAPI.createTrial(submitData);
        toast.success('试验创建成功');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('提交失败:', error);
      toast.error(trial ? '更新失败' : '创建失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {trial ? '编辑试验' : '添加试验'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* 基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                试验标题
              </label>
              <input
                type="text"
                {...register('title')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                疾病领域
              </label>
              <input
                type="text"
                {...register('disease')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="如：糖尿病、高血压等"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                参与者类型
              </label>
              <select
                {...register('participantType')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">选择类型</option>
                <option value="健康者">健康者</option>
                <option value="患者">患者</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                筛选系统
              </label>
              <select
                {...register('screeningSystem')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">选择筛选系统</option>
                <option value="太美">太美</option>
                <option value="中兴联网">中兴联网</option>
                <option value="全国联网">全国联网</option>
                <option value="不联网项目">不联网项目</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                试验地址
              </label>
              <input
                type="text"
                {...register('location')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="如：北京市朝阳区建国门外大街1号"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                城市
              </label>
              <input
                type="text"
                {...register('city')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="如：北京、上海等"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                医院名称
              </label>
              <input
                type="text"
                {...register('hospital')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="如：北京协和医院"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                总受试者数
              </label>
              <input
                type="number"
                {...register('totalSubjects')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="如：100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                补偿金额（元）
              </label>
              <input
                type="number"
                step="0.01"
                {...register('compensation')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="如：5000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                试验周期
              </label>
              <input
                type="text"
                {...register('duration')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="如：3个月"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                推荐费（元）
              </label>
              <input
                type="number"
                step="0.01"
                {...register('referralFee')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="如：500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                报名开始时间
              </label>
              <input
                type="datetime-local"
                {...register('registrationStartDate')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                报名截止时间
              </label>
              <input
                type="datetime-local"
                {...register('registrationDeadline')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* 基本条件 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">基本条件</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最小年龄（岁）
                </label>
                <input
                  type="number"
                  {...register('minAge')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="如：18"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最大年龄（岁）
                </label>
                <input
                  type="number"
                  {...register('maxAge')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="如：65"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  性别要求
                </label>
                <select
                  {...register('genderRequirement')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">不限</option>
                  <option value="男">男</option>
                  <option value="女">女</option>
                  <option value="不限">不限</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最小BMI
                </label>
                <input
                  type="number"
                  step="0.1"
                  {...register('minBmi')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="如：18.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最大BMI
                </label>
                <input
                  type="number"
                  step="0.1"
                  {...register('maxBmi')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="如：30"
                />
              </div>
            </div>
          </div>

          {/* 试验描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              试验介绍
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="详细描述试验的目的、方法等"
            />
          </div>

          {/* 入选标准 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              入选标准
            </label>
            {inclusionCriteria.map((criterion, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={criterion}
                  onChange={(e) => updateCriterion('inclusion', index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={`入选标准 ${index + 1}`}
                />
                {inclusionCriteria.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCriterion('inclusion', index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addCriterion('inclusion')}
              className="flex items-center gap-1 text-primary-600 hover:text-primary-700"
            >
              <Plus className="w-4 h-4" />
              添加入选标准
            </button>
          </div>

          {/* 详情 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              详情
            </label>
            <textarea
              {...register('exclusionCriteria')}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="请输入试验的详细信息，包括排除标准、注意事项、具体流程等..."
            />
          </div>

          {/* 入院说明 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              入院说明
            </label>
            <textarea
              {...register('admissionNotes')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="入院相关的注意事项和说明"
            />
          </div>

          {/* 提交按钮 */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={submitting}
            >
              取消
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? '提交中...' : (trial ? '更新' : '创建')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrialForm; 