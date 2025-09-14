import { create } from 'zustand';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  isAuthenticated: !!localStorage.getItem('token'),

  // 登录
  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.login(credentials);
      const { user, token } = response.data;
      
      // 保存到localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
      
      toast.success('登录成功');
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // 注册
  register: async (userData) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.register(userData);
      const { user, token } = response.data;
      
      // 保存到localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
      
      toast.success('注册成功');
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // 登出
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    
    toast.success('已退出登录');
  },

  // 获取用户信息
  fetchProfile: async () => {
    try {
      const response = await authAPI.getProfile();
      const user = response.data.user;
      
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // 更新用户信息
  updateProfile: async (userData) => {
    set({ isLoading: true });
    try {
      const response = await authAPI.updateProfile(userData);
      const user = response.data.user;
      
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isLoading: false });
      
      toast.success('信息更新成功');
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // 成为代理
  becomeAgent: async () => {
    set({ isLoading: true });
    try {
      const response = await authAPI.becomeAgent();
      const { channelId, role } = response.data;
      
      const updatedUser = { ...get().user, role, channelId, isAgent: true };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      set({ user: updatedUser, isLoading: false });
      
      toast.success('恭喜您成为代理！');
      return { success: true, channelId };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // 验证推荐码
  validateChannelId: async (channelId) => {
    try {
      const response = await authAPI.validateChannelId(channelId);
      return { success: true, agent: response.data.agent };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // 检查是否是代理
  isAgent: () => {
    const user = get().user;
    return user?.role === 'agent' || user?.role === 'admin';
  },

  // 检查是否是管理员
  isAdmin: () => {
    const user = get().user;
    return user?.role === 'admin';
  },
}));

export default useAuthStore; 