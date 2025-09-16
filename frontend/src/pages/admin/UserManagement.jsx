import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  User, 
  Phone, 
  Mail, 
  Calendar,
  Shield,
  ShieldCheck,
  Ban,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('获取用户列表失败:', error);
      toast.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (id, role) => {
    try {
      await adminAPI.updateUserRole(id, { role });
      toast.success('角色更新成功');
      fetchUsers();
    } catch (error) {
      console.error('更新角色失败:', error);
      toast.error('更新角色失败');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'banned' : 'active';
      await adminAPI.updateUserStatus(id, { status: newStatus });
      toast.success('状态更新成功');
      fetchUsers();
    } catch (error) {
      console.error('更新状态失败:', error);
      toast.error('更新状态失败');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone?.includes(searchTerm) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role) => {
    const roleMap = {
      user: { color: 'bg-blue-100 text-blue-800', text: '普通用户', icon: User },
      agent: { color: 'bg-green-100 text-green-800', text: '代理', icon: Shield },
      admin: { color: 'bg-purple-100 text-purple-800', text: '管理员', icon: ShieldCheck }
    };
    const config = roleMap[role] || roleMap.user;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { color: 'bg-green-100 text-green-800', text: '正常', icon: CheckCircle },
      banned: { color: 'bg-red-100 text-red-800', text: '已禁用', icon: XCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: '待验证', icon: Calendar }
    };
    const config = statusMap[status] || statusMap.active;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
        <span className="ml-2 text-gray-600">加载中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">用户管理</h1>
        <div className="text-xs sm:text-sm text-gray-500">
          共 {users.length} 个用户
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
            <input
              type="text"
              placeholder="搜索用户姓名、手机号或邮箱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-9 sm:pl-10 text-sm"
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="input min-w-24 sm:min-w-28 text-sm"
              >
                <option value="all">全部角色</option>
                <option value="user">普通用户</option>
                <option value="agent">代理</option>
                <option value="admin">管理员</option>
              </select>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input min-w-24 sm:min-w-28 text-sm"
            >
              <option value="all">全部状态</option>
              <option value="active">正常</option>
              <option value="banned">已禁用</option>
              <option value="pending">待验证</option>
            </select>
          </div>
        </div>
      </div>

      {/* 用户列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <User className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-gray-500">暂无用户</p>
          </div>
        ) : (
          <>
            {/* 移动端卡片布局 */}
            <div className="block lg:hidden divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <div key={user.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <User className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {user.name || '未知用户'}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {user.id}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-3">
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.status)}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="text-xs text-gray-900 flex items-center">
                      <Phone className="w-3 h-3 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{user.phone || '未提供'}</span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <Mail className="w-3 h-3 mr-2 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{user.email || '未提供'}</span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <Calendar className="w-3 h-3 mr-2 text-gray-400 flex-shrink-0" />
                      <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {user.role !== 'admin' && (
                        <select
                          value={user.role}
                          onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="user">普通用户</option>
                          <option value="agent">代理</option>
                        </select>
                      )}
                    </div>
                    <button
                      onClick={() => handleToggleStatus(user.id, user.status)}
                      className={`p-1.5 rounded ${
                        user.status === 'active' 
                          ? 'text-red-600 hover:text-red-700 hover:bg-red-50' 
                          : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                      }`}
                      title={user.status === 'active' ? '禁用用户' : '启用用户'}
                    >
                      {user.status === 'active' ? (
                        <Ban className="w-4 h-4" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 桌面端表格布局 */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      用户信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      联系方式
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      角色
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      注册时间
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                            <User className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.name || '未知用户'}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-900 flex items-center">
                            <Phone className="w-3 h-3 mr-1 text-gray-400" />
                            {user.phone || '未提供'}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="w-3 h-3 mr-1 text-gray-400" />
                            {user.email || '未提供'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          {user.role !== 'admin' && (
                            <select
                              value={user.role}
                              onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="user">普通用户</option>
                              <option value="agent">代理</option>
                            </select>
                          )}
                          <button
                            onClick={() => handleToggleStatus(user.id, user.status)}
                            className={`p-1 rounded ${
                              user.status === 'active' 
                                ? 'text-red-600 hover:text-red-700' 
                                : 'text-green-600 hover:text-green-700'
                            }`}
                            title={user.status === 'active' ? '禁用用户' : '启用用户'}
                          >
                            {user.status === 'active' ? (
                              <Ban className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserManagement; 