import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileImage, 
  BookOpen, 
  Stethoscope, 
  FileText, 
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import useAuthStore from '../stores/authStore';
import logoSvg from '../assets/images/logo.svg';

const Admin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // 默认关闭
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // 折叠模式
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const navigation = [
    { name: '仪表板', href: '/admin', icon: LayoutDashboard },
    { name: '横幅管理', href: '/admin/banners', icon: FileImage },
    { name: '试验管理', href: '/admin/trials', icon: Stethoscope },
    { name: '申请管理', href: '/admin/applications', icon: FileText },
    { name: '博客管理', href: '/admin/articles', icon: BookOpen },
    { name: '用户管理', href: '/admin/users', icon: Users },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
  };

  // 切换侧边栏显示/隐藏
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    if (sidebarCollapsed) {
      setSidebarCollapsed(false);
    }
  };

  // 切换侧边栏折叠/展开
  const toggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    if (!sidebarOpen) {
      setSidebarOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 侧边栏 */}
      <div className={`fixed inset-y-0 left-0 z-50 ${
        sidebarCollapsed && !window.innerWidth || window.innerWidth < 1024 ? 'w-16' : sidebarCollapsed ? 'w-16' : 'w-64'
      } bg-white shadow-lg transform transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        {/* Logo区域 */}
        <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 bg-primary-600">
          <div className="flex items-center">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-lg flex items-center justify-center p-1">
              <img src={logoSvg} alt="Logo" className="w-full h-full" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-white font-bold text-base sm:text-lg ml-2 sm:ml-3">后台管理</span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white hover:text-gray-200 lg:hidden"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* 折叠/展开按钮 */}
        <div className="flex justify-end p-1.5 sm:p-2 hidden lg:block">
          <button
            onClick={toggleCollapse}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            title={sidebarCollapsed ? "展开侧边栏" : "折叠侧边栏"}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            ) : (
              <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
          </button>
        </div>

        {/* 导航菜单 */}
        <nav className="mt-2 sm:mt-4">
          <div className="px-1.5 sm:px-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-2 sm:px-3 py-2.5 sm:py-3 mb-1.5 sm:mb-2 text-xs sm:text-sm font-medium rounded-lg transition-colors group ${
                    isActive(item.href)
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={sidebarCollapsed ? item.name : ''}
                  onClick={() => {
                    // 在移动端点击后关闭侧边栏
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="ml-2 sm:ml-3">{item.name}</span>}
                  {sidebarCollapsed && (
                    <div className="absolute left-12 sm:left-16 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* 用户信息 */}
        <div className="absolute bottom-0 w-full p-3 sm:p-4 border-t border-gray-200">
          <div className={`flex items-center mb-3 sm:mb-4 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-bold text-sm sm:text-base">
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 ml-2 sm:ml-3 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500">管理员</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`flex items-center w-full px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            title={sidebarCollapsed ? "退出登录" : ''}
          >
            <LogOut className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span className="ml-2 sm:ml-3">退出登录</span>}
          </button>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className={`transition-all duration-300 lg:ml-64 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        {/* 顶部栏 */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 lg:px-6">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={toggleSidebar}
                className="text-gray-600 hover:text-gray-900 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 lg:hidden"
                title={sidebarOpen ? "隐藏侧边栏" : "显示侧边栏"}
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                {navigation.find(item => isActive(item.href))?.name || '后台管理'}
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                欢迎，{user?.name}
              </span>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary-100 rounded-full flex items-center justify-center sm:hidden">
                <span className="text-primary-600 font-bold text-xs">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 页面内容 */}
        <main className="p-3 sm:p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* 移动端遮罩 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Admin; 