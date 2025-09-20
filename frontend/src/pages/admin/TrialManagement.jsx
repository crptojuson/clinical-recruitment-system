import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Calendar,
  Users,
  Search,
  Filter
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import TrialForm from '../../components/admin/TrialForm';
import Pagination from '../../components/Pagination';

const TrialManagement = () => {
  const [trials, setTrials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [screeningSystemFilter, setScreeningSystemFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTrial, setEditingTrial] = useState(null);
  const [editingSubjects, setEditingSubjects] = useState(null);
  const [subjectsInput, setSubjectsInput] = useState('');
  // 添加分页状态
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchTrials();
  }, [pagination.page, statusFilter, screeningSystemFilter]);

  const fetchTrials = async () => {
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        screeningSystem: screeningSystemFilter !== 'all' ? screeningSystemFilter : undefined
      };
      const response = await adminAPI.getTrials(params);
      setTrials(response.data.trials || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination?.total || 0,
        totalPages: response.data.pagination?.totalPages || 0
      }));
    } catch (error) {
      console.error('获取试验列表失败:', error);
      toast.error('获取试验列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'recruiting' ? 'completed' : 'recruiting';
      await adminAPI.updateTrialStatus(id, { status: newStatus });
      toast.success('状态更新成功');
      fetchTrials();
    } catch (error) {
      console.error('更新状态失败:', error);
      toast.error('更新状态失败');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这个试验项目吗？')) return;
    
    try {
      await adminAPI.deleteTrial(id);
      toast.success('试验删除成功');
      fetchTrials();
    } catch (error) {
      console.error('删除失败:', error);
      toast.error('删除失败');
    }
  };

  const handleAdd = () => {
    setEditingTrial(null);
    setShowForm(true);
  };

  const handleEdit = (trial) => {
    setEditingTrial(trial);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTrial(null);
  };

  const handleFormSuccess = () => {
    fetchTrials();
  };

  const handleEditSubjects = (trial) => {
    setEditingSubjects(trial.id);
    setSubjectsInput(trial.currentSubjects || '');
  };

  const handleSaveSubjects = async (trialId) => {
    try {
      const currentSubjects = parseInt(subjectsInput);
      if (isNaN(currentSubjects) || currentSubjects < 0) {
        toast.error('请输入有效的已参与人数');
        return;
      }

      await adminAPI.updateTrial(trialId, { currentSubjects });
      toast.success('已参与人数更新成功');
      setEditingSubjects(null);
      setSubjectsInput('');
      fetchTrials();
    } catch (error) {
      console.error('更新已参与人数失败:', error);
      toast.error('更新失败，请重试');
    }
  };

  const handleCancelEditSubjects = () => {
    setEditingSubjects(null);
    setSubjectsInput('');
  };

  // 过滤逻辑改为仅处理搜索词，其他筛选通过API处理
  const filteredTrials = trials.filter(trial => {
    if (!searchTerm) return true;
    const matchesSearch = trial.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trial.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
        <span className="ml-2 text-gray-600">加载中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">试验管理</h1>
        <button 
          onClick={handleAdd}
          className="btn btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          添加试验
        </button>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="搜索试验项目..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="input min-w-32"
            >
              <option value="all">全部状态</option>
              <option value="recruiting">招募中</option>
              <option value="completed">已完成</option>
            </select>
            <select
              value={screeningSystemFilter}
              onChange={(e) => {
                setScreeningSystemFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="input min-w-32"
            >
              <option value="all">全部系统</option>
              <option value="太美">太美</option>
              <option value="中兴联网">中兴联网</option>
              <option value="全国联网">全国联网</option>
              <option value="不联网项目">不联网项目</option>
            </select>
          </div>
        </div>
      </div>

      {/* 试验列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredTrials.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">暂无试验项目</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    试验信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    已参与人数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    报名时间
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    创建时间
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTrials.map((trial) => (
                  <tr key={trial.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {trial.title || '未命名试验'}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-2">
                          {trial.description || '暂无描述'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {trial.status === 'recruiting' ? (
                          <>
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                            <span className="text-sm text-green-700">招募中</span>
                          </>
                        ) : trial.status === 'completed' ? (
                          <>
                            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                            <span className="text-sm text-blue-700">已完成</span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                            <span className="text-sm text-gray-500">已暂停</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {editingSubjects === trial.id ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-900">{trial.currentSubjects || 0} /</span>
                            <input
                              type="number"
                              value={subjectsInput}
                              onChange={(e) => setSubjectsInput(e.target.value)}
                              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                              min="1"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveSubjects(trial.id)}
                              className="text-green-600 hover:text-green-700"
                              title="保存"
                            >
                              ✓
                            </button>
                            <button
                              onClick={handleCancelEditSubjects}
                              className="text-gray-400 hover:text-gray-600"
                              title="取消"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-900">
                              {trial.currentSubjects || 0}人
                            </span>
                            <button
                              onClick={() => handleEditSubjects(trial)}
                              className="text-gray-400 hover:text-primary-600"
                              title="编辑已参与人数"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {trial.registrationStartDate && (
                          <div className="mb-1">
                            <span className="text-green-600">开始:</span> {new Date(trial.registrationStartDate).toLocaleDateString('zh-CN')}
                          </div>
                        )}
                        {trial.registrationDeadline && (
                          <div>
                            <span className="text-red-600">截止:</span> {new Date(trial.registrationDeadline).toLocaleDateString('zh-CN')}
                      </div>
                        )}
                        {!trial.registrationStartDate && !trial.registrationDeadline && (
                          <span className="text-gray-500">未设置</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {trial.createdAt ? new Date(trial.createdAt).toLocaleDateString() : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleToggleStatus(trial.id, trial.status)}
                          className="text-blue-600 hover:text-blue-700"
                          title={trial.status === 'recruiting' ? '完成试验' : '重新招募'}
                        >
                          {trial.status === 'recruiting' ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(trial)}
                          className="text-primary-600 hover:text-primary-700"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(trial.id)}
                          className="text-red-600 hover:text-red-700"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 试验表单 */}
      <TrialForm
        trial={editingTrial}
        isOpen={showForm}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
      />

             {/* 分页 */}
       {pagination.totalPages > 1 && (
         <Pagination
           currentPage={pagination.page}
           totalPages={pagination.totalPages}
           totalItems={pagination.total}
           itemsPerPage={pagination.limit}
           onPageChange={handlePageChange}
         />
       )}
    </div>
  );
};

export default TrialManagement; 