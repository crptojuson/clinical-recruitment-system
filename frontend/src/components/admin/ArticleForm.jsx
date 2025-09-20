import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Plus, Minus, Save, Eye, Upload } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ArticleForm = ({ article, onClose, onSuccess }) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [wordFile, setWordFile] = useState(null);
  const [uploadMode, setUploadMode] = useState(false);

  const categories = [
    '临床试验科普',
    '疾病知识',
    '治疗方案',
    '患者故事',
    '医学前沿',
    '健康生活'
  ];

  useEffect(() => {
    if (article) {
      // 编辑模式：填充表单
      Object.keys(article).forEach(key => {
        if (key === 'tags') {
          setTags(article.tags || []);
        } else {
          setValue(key, article[key] || '');
        }
      });
    }
  }, [article, setValue]);

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error('请选择Word文档文件 (.doc 或 .docx)');
        return;
      }
      setWordFile(file);
    }
  };

  const handleWordUpload = async (data) => {
    if (!wordFile) {
      toast.error('请选择Word文档');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('wordFile', wordFile);
      formData.append('title', data.title);
      formData.append('author', data.author);
      formData.append('category', data.category);
      formData.append('summary', data.summary || '');
      formData.append('tags', tags.join(','));
      formData.append('featured', data.featured === 'true');

      const token = localStorage.getItem('token');
      const response = await fetch('/api/articles/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Word文档上传成功！');
        onSuccess?.();
        onClose();
      } else {
        toast.error(result.message || '上传失败');
      }
    } catch (error) {
      console.error('上传失败:', error);
      toast.error('上传失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    if (uploadMode && !article) {
      // Word文档上传模式
      await handleWordUpload(data);
      return;
    }

    setLoading(true);
    try {
      const articleData = {
        ...data,
        tags,
        featured: data.featured === 'true',
        isActive: data.isActive !== 'false'
      };

      if (article) {
        // 更新文章
        await adminAPI.updateArticle(article.id, articleData);
        toast.success('文章更新成功');
      } else {
        // 创建文章
        await adminAPI.createArticle(articleData);
        toast.success('文章创建成功');
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('保存文章失败:', error);
      toast.error(article ? '更新文章失败' : '创建文章失败');
    } finally {
      setLoading(false);
    }
  };

  const watchedContent = watch('content', '');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {article ? '编辑文章' : '新建文章'}
          </h2>
          <div className="flex items-center space-x-2">
            {!article && (
              <button
                type="button"
                onClick={() => setUploadMode(!uploadMode)}
                className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                  uploadMode 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Upload className="w-4 h-4 mr-1" />
                {uploadMode ? 'Word上传' : '手动输入'}
              </button>
            )}
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              <Eye className="w-4 h-4 mr-1" />
              {previewMode ? '编辑' : '预览'}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-hidden">
          <div className="flex h-[calc(90vh-120px)]">
            {/* 左侧：表单 */}
            <div className={`${previewMode ? 'w-1/2' : 'w-full'} p-6 overflow-y-auto border-r`}>
              <div className="space-y-6">
                {/* Word文档上传 */}
                {uploadMode && !article && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-blue-900 mb-3">上传Word文档</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          选择Word文档 *
                        </label>
                        <input
                          type="file"
                          accept=".doc,.docx"
                          onChange={handleFileChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required={uploadMode}
                        />
                        {wordFile && (
                          <p className="text-sm text-green-600 mt-1">
                            已选择: {wordFile.name}
                          </p>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        <p className="mb-1">• 支持 .doc 和 .docx 格式</p>
                        <p className="mb-1">• 文档内容将自动转换为HTML格式</p>
                        <p>• 如未填写摘要，将自动从文档内容生成</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 基本信息 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      文章标题 *
                    </label>
                    <input
                      {...register('title', { required: '标题不能为空' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="请输入文章标题"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      作者 *
                    </label>
                    <input
                      {...register('author', { required: '作者不能为空' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="请输入作者名称"
                    />
                    {errors.author && (
                      <p className="text-red-500 text-sm mt-1">{errors.author.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      分类 *
                    </label>
                    <select
                      {...register('category', { required: '分类不能为空' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">请选择分类</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      阅读时间
                    </label>
                    <input
                      {...register('readTime')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="如：5 分钟"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      封面图片URL
                    </label>
                    <input
                      {...register('imageUrl')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="请输入图片URL"
                    />
                  </div>
                </div>

                {/* 文章摘要 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    文章摘要 {uploadMode ? '(可选，将自动生成)' : '*'}
                  </label>
                  <textarea
                    {...register('summary', { required: !uploadMode ? '摘要不能为空' : false })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder={uploadMode ? "可选，如不填写将自动从文档内容生成" : "请输入文章摘要"}
                  />
                  {errors.summary && (
                    <p className="text-red-500 text-sm mt-1">{errors.summary.message}</p>
                  )}
                </div>

                {/* 标签管理 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    标签
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="输入标签后按回车添加"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 文章内容 */}
                {!uploadMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    文章内容 * (支持HTML)
                  </label>
                  <textarea
                      {...register('content', { required: !uploadMode ? '内容不能为空' : false })}
                    rows={15}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                    placeholder="请输入文章内容，支持HTML标签"
                  />
                  {errors.content && (
                    <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
                  )}
                </div>
                )}

                {/* 文章设置 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      是否精选
                    </label>
                    <select
                      {...register('featured')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="false">否</option>
                      <option value="true">是</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      状态
                    </label>
                    <select
                      {...register('isActive')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="true">启用</option>
                      <option value="false">禁用</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧：预览 */}
            {previewMode && (
              <div className="w-1/2 p-6 overflow-y-auto bg-gray-50">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    {watch('title') || '文章标题'}
                  </h1>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <span>作者：{watch('author') || '未设置'}</span>
                    <span className="mx-2">•</span>
                    <span>分类：{watch('category') || '未设置'}</span>
                    {watch('readTime') && (
                      <>
                        <span className="mx-2">•</span>
                        <span>阅读时间：{watch('readTime')}</span>
                      </>
                    )}
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="text-gray-600 mb-6">
                    {watch('summary') || '文章摘要'}
                  </div>
                  <div 
                    className="prose max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900 prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3 prose-ul:my-4 prose-li:my-1 prose-p:my-4 prose-p:leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: watchedContent || '<p>文章内容</p>' 
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 底部按钮 */}
          <div className="flex items-center justify-end space-x-4 p-6 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : uploadMode && !article ? (
                <Upload className="w-4 h-4 mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {article ? '更新文章' : uploadMode ? '上传Word文档' : '创建文章'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArticleForm; 