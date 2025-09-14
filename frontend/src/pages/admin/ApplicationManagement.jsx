import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, Check, X, ChevronDown, User, Phone, Mail, Download, FileSpreadsheet, UserCheck, Calendar, Clock } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ApplicationManagement = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(null);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showStatusMenu && !event.target.closest('.status-menu')) {
        setShowStatusMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStatusMenu]);

  const fetchApplications = async () => {
    try {
      const response = await adminAPI.getApplications();
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error('获取申请列表失败:', error);
      toast.error('获取申请列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await adminAPI.updateApplicationStatus(id, { status });
      toast.success('状态更新成功');
      fetchApplications();
    } catch (error) {
      console.error('更新状态失败:', error);
      toast.error('更新状态失败');
    }
  };

  const handleViewDetail = (application) => {
    setSelectedApplication(application);
    setShowDetail(true);
  };

  const statusOptions = [
    { value: 'pending', label: '待审核', color: 'text-yellow-600' },
    { value: 'approved', label: '已通过', color: 'text-green-600' },
    { value: 'rejected', label: '已拒绝', color: 'text-red-600' },
    { value: 'medical_check', label: '体检阶段', color: 'text-purple-600' },
    { value: 'enrolled', label: '已入组', color: 'text-indigo-600' },
    { value: 'completed', label: '已完成', color: 'text-blue-600' },
    { value: 'withdrawn', label: '主动退出', color: 'text-gray-600' },
    { value: 'screening_failed', label: '筛选失败', color: 'text-orange-600' }
  ];

  const handleStatusChange = (applicationId, newStatus) => {
    handleUpdateStatus(applicationId, newStatus);
    setShowStatusMenu(null);
  };

  // 批量选择功能
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedApplications([]);
      setSelectAll(false);
    } else {
      setSelectedApplications(filteredApplications.map(app => app.id));
      setSelectAll(true);
    }
  };

  const handleSelectApplication = (id) => {
    if (selectedApplications.includes(id)) {
      setSelectedApplications(prev => prev.filter(appId => appId !== id));
      setSelectAll(false);
    } else {
      setSelectedApplications(prev => [...prev, id]);
    }
  };

  // 导出Excel功能
  const exportToExcel = async () => {
    if (selectedApplications.length === 0) {
      toast.error('请选择要导出的申请');
      return;
    }

    setIsExporting(true);
    try {
      // 获取选中申请的详细信息
      const selectedAppsData = applications.filter(app => 
        selectedApplications.includes(app.id)
      );

      // 准备导出数据
      const exportData = selectedAppsData.map(app => ({
        '申请编号': app.id,
        '申请人姓名': app.name || app.user?.name || '未知',
        '手机号码': app.phone || app.user?.phone || '未知',
        '身份证号': app.idCard || '未提供',
        '性别': app.gender || '未提供',
        '年龄': app.age || '未提供',
        '身高(cm)': app.height || '未提供',
        '体重(kg)': app.weight || '未提供',
        'BMI': app.bmi || '未提供',
        '试验项目': app.trial?.title || '未知',
        '试验医院': app.trial?.hospital || '未知',
        '补偿金额': app.trial?.compensation || 0,
        '推荐者': app.referrer?.name || '本人报名',
        '推荐者手机': app.referrer?.phone || '-',
        '申请状态': getStatusText(app.status),
        '申请时间': app.createdAt ? new Date(app.createdAt).toLocaleString() : '-',
        '吸烟状态': app.smokingStatus || '未提供',
        '既往病史': app.medicalHistory || '无',
        '当前用药': app.currentMedications || '无',
        '过敏史': app.allergies || '无',
        '紧急联系人': app.emergencyContact || '未提供',
        '紧急联系电话': app.emergencyPhone || '未提供',
        '备注': app.notes || '无'
      }));

      // 创建CSV内容
      const headers = Object.keys(exportData[0]);
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => `"${row[header] || ''}"`).join(',')
        )
      ].join('\n');

      // 创建并下载文件
      const blob = new Blob(['\ufeff' + csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `申请者信息_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`已导出 ${selectedApplications.length} 条申请信息`);
      setSelectedApplications([]);
      setSelectAll(false);
    } catch (error) {
      console.error('导出失败:', error);
      toast.error('导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  // 获取状态文本
  const getStatusText = (status) => {
    const statusMap = {
      pending: '待审核',
      approved: '已通过',
      rejected: '已拒绝',
      completed: '已完成',
      cancelled: '已取消',
      withdrawn: '主动退出',
      screening_failed: '筛选失败'
    };
    return statusMap[status] || status;
  };

  const filteredApplications = applications.filter(application => {
    const userName = application.user?.name || application.userName || '';
    const userPhone = application.user?.phone || application.userPhone || '';
    const trialTitle = application.trial?.title || application.trialTitle || '';
    
    const matchesSearch = userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userPhone.includes(searchTerm) ||
                         trialTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || application.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: '待审核' },
      approved: { color: 'bg-green-100 text-green-800', text: '已通过' },
      rejected: { color: 'bg-red-100 text-red-800', text: '已拒绝' },
      completed: { color: 'bg-blue-100 text-blue-800', text: '已完成' },
      medical_check: { color: 'bg-purple-100 text-purple-800', text: '体检阶段' },
      enrolled: { color: 'bg-indigo-100 text-indigo-800', text: '已入组' },
      withdrawn: { color: 'bg-gray-100 text-gray-800', text: '主动退出' },
      screening_failed: { color: 'bg-orange-100 text-orange-800', text: '筛选失败' }
    };
    const config = statusMap[status] || statusMap.pending;
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
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
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">申请管理</h1>
        <div className="flex items-center space-x-4">
          {selectedApplications.length > 0 && (
            <button
              onClick={exportToExcel}
              disabled={isExporting}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  导出中...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  导出选中 ({selectedApplications.length})
                </>
              )}
            </button>
          )}
        <div className="text-sm text-gray-500">
          共 {applications.length} 个申请
          </div>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="搜索申请人姓名、手机号或试验项目..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input min-w-32"
            >
              <option value="all">全部状态</option>
              <option value="pending">待审核</option>
              <option value="approved">已通过</option>
              <option value="rejected">已拒绝</option>
              <option value="medical_check">体检阶段</option>
              <option value="enrolled">已入组</option>
              <option value="completed">已完成</option>
              <option value="withdrawn">主动退出</option>
              <option value="screening_failed">筛选失败</option>
            </select>
          </div>
        </div>
      </div>

      {/* 申请列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">暂无申请记录</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    申请人信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    试验项目
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    申请时间
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedApplications.includes(application.id)}
                        onChange={() => handleSelectApplication(application.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {application.user?.name || application.userName || '未知用户'}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {application.user?.phone || application.userPhone || '未提供'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {application.trial?.title || application.trialTitle || '未知试验'}
                      </div>
                      {application.trial?.hospital && (
                        <div className="text-xs text-gray-500">
                          {application.trial.hospital}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(application.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetail(application)}
                          className="text-blue-600 hover:text-blue-700"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {/* 状态更改下拉菜单 */}
                        <div className="relative status-menu">
                          <button
                            onClick={() => setShowStatusMenu(showStatusMenu === application.id ? null : application.id)}
                            className="text-gray-600 hover:text-gray-700 flex items-center"
                            title="更改状态"
                          >
                            <Edit className="w-4 h-4" />
                            <ChevronDown className="w-3 h-3 ml-1" />
                          </button>
                          
                          {showStatusMenu === application.id && (
                            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                              {statusOptions.map((option) => (
                                <button
                                  key={option.value}
                                  onClick={() => handleStatusChange(application.id, option.value)}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${option.color} ${
                                    application.status === option.value ? 'bg-gray-50 font-medium' : ''
                                  }`}
                                  disabled={application.status === option.value}
                                >
                                  {option.label}
                                  {application.status === option.value && (
                                    <span className="ml-1 text-xs text-gray-500">(当前)</span>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* 快速操作按钮（仅对待审核状态显示） */}
                        {application.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(application.id, 'approved')}
                              className="text-green-600 hover:text-green-700"
                              title="快速通过"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(application.id, 'rejected')}
                              className="text-red-600 hover:text-red-700"
                              title="快速拒绝"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 申请详情模态框 */}
      {showDetail && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">申请详情</h3>
                <button
                  onClick={() => setShowDetail(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* 基本信息 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">申请人基本信息</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm">{selectedApplication.name || selectedApplication.user?.name || '未知用户'}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm">{selectedApplication.phone || selectedApplication.user?.phone || '未提供'}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm">{selectedApplication.user?.email || '未提供'}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-2 text-sm">身份证:</span>
                        <span className="text-sm font-mono">{selectedApplication.idCard || '未提供'}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-2 text-sm">性别:</span>
                        <span className="text-sm">{selectedApplication.gender || '未提供'}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-2 text-sm">年龄:</span>
                        <span className="text-sm">{selectedApplication.age || '未提供'}岁</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-2 text-sm">出生日期:</span>
                        <span className="text-sm">{selectedApplication.birthday || '未提供'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 推荐者信息 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">推荐信息</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <UserCheck className="w-5 h-5 text-blue-500 mr-3" />
                      <div>
                        {selectedApplication.referrer ? (
                          <div>
                            <div className="text-sm font-medium text-blue-900">
                              推荐者: {selectedApplication.referrer.name}
                            </div>
                            <div className="text-xs text-blue-700">
                              联系方式: {selectedApplication.referrer.phone}
                            </div>
                            {selectedApplication.referrer.email && (
                              <div className="text-xs text-blue-600">
                                邮箱: {selectedApplication.referrer.email}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium text-green-700">本人报名</span>
                            <span className="text-xs text-gray-500 ml-2">无推荐者</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 身体信息 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">身体信息</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-xs text-gray-500">身高</div>
                        <div className="text-lg font-semibold text-blue-600">{selectedApplication.height || '-'}cm</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500">体重</div>
                        <div className="text-lg font-semibold text-green-600">{selectedApplication.weight || '-'}kg</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500">BMI</div>
                        <div className="text-lg font-semibold text-purple-600">{selectedApplication.bmi || '-'}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 医疗信息 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">医疗信息</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center">
                      <span className="text-gray-400 text-sm w-20">吸烟状态:</span>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        selectedApplication.smokingStatus === '不吸烟' ? 'bg-green-100 text-green-800' :
                        selectedApplication.smokingStatus === '已戒烟' ? 'bg-blue-100 text-blue-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {selectedApplication.smokingStatus || '未提供'}
                      </span>
                    </div>
                    
                    {selectedApplication.diseases && selectedApplication.diseases.length > 0 && (
                      <div>
                        <span className="text-gray-400 text-sm">疾病史:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedApplication.diseases.map((disease, index) => (
                            <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                              {disease}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedApplication.medicalHistory && (
                      <div>
                        <span className="text-gray-400 text-sm">既往病史:</span>
                        <p className="text-sm mt-1 bg-white p-3 rounded border-l-4 border-blue-400">{selectedApplication.medicalHistory}</p>
                      </div>
                    )}
                    
                    {selectedApplication.currentMedications && (
                      <div>
                        <span className="text-gray-400 text-sm">当前用药:</span>
                        <p className="text-sm mt-1 bg-white p-3 rounded border-l-4 border-green-400">{selectedApplication.currentMedications}</p>
                      </div>
                    )}
                    
                    {selectedApplication.allergies && (
                      <div>
                        <span className="text-gray-400 text-sm">过敏史:</span>
                        <p className="text-sm mt-1 bg-white p-3 rounded border-l-4 border-red-400">{selectedApplication.allergies}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 紧急联系人 */}
                {(selectedApplication.emergencyContact || selectedApplication.emergencyPhone) && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">紧急联系人</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-2 text-sm">姓名:</span>
                          <span className="text-sm">{selectedApplication.emergencyContact || '未提供'}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-400 mr-2 text-sm">电话:</span>
                          <span className="text-sm">{selectedApplication.emergencyPhone || '未提供'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 试验信息 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">试验项目详情</h4>
                  <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-lg font-semibold text-blue-900">{selectedApplication.trial?.title || selectedApplication.trialTitle || '未知试验'}</p>
                      {selectedApplication.trial?.hospital && (
                        <p className="text-sm text-blue-700 mt-1">医院: {selectedApplication.trial.hospital}</p>
                      )}
                    </div>
                    
                    {selectedApplication.trial && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white p-3 rounded">
                            <span className="text-xs text-gray-500">补偿金额</span>
                            <div className="text-lg font-bold text-green-600">¥{selectedApplication.trial.compensation}</div>
                          </div>
                          <div className="bg-white p-3 rounded">
                            <span className="text-xs text-gray-500">试验周期</span>
                            <div className="text-sm font-medium">{selectedApplication.trial.duration}</div>
                          </div>
                          <div className="bg-white p-3 rounded">
                            <span className="text-xs text-gray-500">疾病类型</span>
                            <div className="text-sm font-medium">{selectedApplication.trial.disease}</div>
                          </div>
                          <div className="bg-white p-3 rounded">
                            <span className="text-xs text-gray-500">参与者类型</span>
                            <div className="text-sm font-medium">{selectedApplication.trial.participantType}</div>
                          </div>
                        </div>
                        
                        <div className="bg-white p-3 rounded">
                          <span className="text-xs text-gray-500">试验地点</span>
                          <p className="text-sm mt-1 font-medium">{selectedApplication.trial.hospital}</p>
                          <p className="text-xs text-gray-600">{selectedApplication.trial.address}</p>
                        </div>
                        
                        {selectedApplication.trial.description && (
                          <div className="bg-white p-3 rounded">
                            <span className="text-xs text-gray-500">试验描述</span>
                            <p className="text-sm mt-1 text-gray-700 leading-relaxed">{selectedApplication.trial.description}</p>
                          </div>
                        )}
                        
                        {selectedApplication.trial.requirements && (
                          <div className="bg-white p-3 rounded">
                            <span className="text-xs text-gray-500">入选标准</span>
                            <p className="text-sm mt-1 text-gray-700 leading-relaxed">{selectedApplication.trial.requirements}</p>
                          </div>
                        )}
                        
                        {selectedApplication.trial.exclusionCriteria && (
                          <div className="bg-white p-3 rounded">
                            <span className="text-xs text-gray-500">排除标准</span>
                            <p className="text-sm mt-1 text-gray-700 leading-relaxed">{selectedApplication.trial.exclusionCriteria}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* 申请状态信息 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">申请状态</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">当前状态:</span>
                      {getStatusBadge(selectedApplication.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">申请时间:</span>
                      <span className="text-sm font-medium">
                        {selectedApplication.createdAt ? new Date(selectedApplication.createdAt).toLocaleString() : '-'}
                      </span>
                    </div>
                    {selectedApplication.reviewedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">审核时间:</span>
                        <span className="text-sm font-medium">
                          {new Date(selectedApplication.reviewedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {selectedApplication.reviewNotes && (
                      <div>
                        <span className="text-sm text-gray-600">审核备注:</span>
                        <p className="text-sm mt-1 bg-white p-3 rounded border-l-4 border-yellow-400">{selectedApplication.reviewNotes}</p>
                      </div>
                    )}
                    {selectedApplication.notes && (
                      <div>
                        <span className="text-sm text-gray-600">申请备注:</span>
                        <p className="text-sm mt-1 bg-white p-3 rounded border-l-4 border-gray-400">{selectedApplication.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowDetail(false)}
                  className="btn btn-secondary"
                >
                  关闭
                </button>
                {selectedApplication.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedApplication.id, 'approved');
                        setShowDetail(false);
                      }}
                      className="btn btn-success"
                    >
                      通过申请
                    </button>
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedApplication.id, 'rejected');
                        setShowDetail(false);
                      }}
                      className="btn btn-danger"
                    >
                      拒绝申请
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationManagement; 