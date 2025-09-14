import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// 创建axios实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || '网络错误';
    
    // 401错误 - 未授权，清除token并跳转登录
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // 显示错误提示
    toast.error(message);
    return Promise.reject(error);
  }
);

// 认证相关API
export const authAPI = {
  // 注册
  register: (userData) => api.post('/auth/register', userData),
  
  // 登录
  login: (credentials) => api.post('/auth/login', credentials),
  
  // 获取用户信息
  getProfile: () => api.get('/auth/profile'),
  
  // 更新用户信息
  updateProfile: (userData) => api.put('/auth/profile', userData),
  
  // 成为代理
  becomeAgent: () => api.post('/auth/become-agent'),
  
  // 验证推荐码
  validateChannelId: (channelId) => api.get(`/auth/validate-channel/${channelId}`),
  
  // 获取推荐用户列表
  getReferrals: () => api.get('/auth/referrals'),
};

// 试验项目相关API
export const trialsAPI = {
  // 获取试验列表
  getTrials: (params) => api.get('/trials', { params }),
  
  // 获取试验详情
  getTrialById: (id) => api.get(`/trials/${id}`),
  
  // 获取疾病列表
  getDiseases: () => api.get('/trials/meta/diseases'),
  
  // 获取城市列表
  getCities: () => api.get('/trials/meta/cities'),
  
  // 获取参与者类型列表
  getParticipantTypes: () => api.get('/trials/meta/participant-types'),
  
  // 获取筛选系统列表
  getScreeningSystems: () => api.get('/trials/meta/screening-systems'),
  
  // 创建试验项目（管理员）
  createTrial: (trialData) => api.post('/trials', trialData),
  
  // 更新试验项目（管理员）
  updateTrial: (id, trialData) => api.put(`/trials/${id}`, trialData),
  
  // 删除试验项目（管理员）
  deleteTrial: (id) => api.delete(`/trials/${id}`),
  
  // 更新试验状态（管理员）
  updateTrialStatus: (id, status) => api.patch(`/trials/${id}/status`, { status }),
  
  // 获取试验统计（管理员）
  getTrialStats: (id) => api.get(`/trials/${id}/stats`),
};

// 申请相关API
export const applicationsAPI = {
  // 报名试验（需要登录）
  apply: (trialId, applicationData) => api.post(`/applications/${trialId}`, applicationData),
  
  // 公开报名试验（允许未注册用户）
  applyPublic: (trialId, applicationData) => api.post(`/applications/public/${trialId}`, applicationData),
  
  // 获取我的申请列表
  getMyApplications: (params) => api.get('/applications/my', { params }),
  
  // 获取我的申请列表（带分页）
  getMyApplicationsList: (params) => api.get(`/applications/my/list`, { params }),
  
  // 获取申请详情
  getApplicationById: (id) => api.get(`/applications/${id}`),
  
  // 获取申请详情（详细版本）
  getApplicationDetail: (id) => api.get(`/applications/${id}/detail`),
  
  // 撤回申请
  withdrawApplication: (id, reason) => api.put(`/applications/${id}/withdraw`, { reason }),
};

// 文章相关API
export const articlesAPI = {
  // 获取公开文章列表
  getPublicArticles: (params) => api.get('/articles', { params }),
  
  // 获取文章详情
  getArticleById: (id) => api.get(`/articles/${id}`),
  
  // 增加文章阅读量
  incrementViews: (id) => api.post(`/articles/${id}/views`),
  
  // 获取相关文章推荐
  getRelatedArticles: (id, params) => api.get(`/articles/${id}/related`, { params }),
};

// 管理员API
export const adminAPI = {
  // 统计数据
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  
  // 横幅管理
  getBanners: () => api.get('/admin/banners'),
  createBanner: (data) => api.post('/admin/banners', data),
  updateBanner: (id, data) => api.put(`/admin/banners/${id}`, data),
  deleteBanner: (id) => api.delete(`/admin/banners/${id}`),
  
  // 博客管理
  getArticles: (params) => api.get('/admin/articles', { params }),
  createArticle: (data) => api.post('/admin/articles', data),
  updateArticle: (id, data) => api.put(`/admin/articles/${id}`, data),
  deleteArticle: (id) => api.delete(`/admin/articles/${id}`),
  
  // 试验管理
  getTrials: (params) => api.get('/admin/trials', { params }),
  createTrial: (data) => api.post('/admin/trials', data),
  updateTrial: (id, data) => api.put(`/admin/trials/${id}`, data),
  updateTrialStatus: (id, data) => api.put(`/admin/trials/${id}/status`, data),
  deleteTrial: (id) => api.delete(`/admin/trials/${id}`),
  
  // 申请管理
  getApplications: (params) => api.get('/admin/applications', { params }),
  updateApplicationStatus: (id, data) => api.put(`/admin/applications/${id}/status`, data),
  
  // 用户管理
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, data) => api.put(`/admin/users/${id}/role`, data),
  updateUserStatus: (id, data) => api.put(`/admin/users/${id}/status`, data),
  
  // 文章管理
  updateArticleStatus: (id, data) => api.put(`/admin/articles/${id}/status`, data),
};

// AI咨询API
export const aiAPI = {
  consultDrug: (data) => api.post('/ai/consult-drug', data, { timeout: 60000 }),
};

// 通用工具函数
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export default api; 