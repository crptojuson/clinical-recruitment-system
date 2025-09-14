import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from './stores/authStore';

// 页面组件
import Layout from './components/Layout';
import Home from './pages/Home';
import TrialDetail from './pages/TrialDetail';
import Blog from './pages/Blog';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Applications from './pages/Applications';
import Apply from './pages/Apply';
import MyApplications from './pages/MyApplications';
import ApplicationDetail from './pages/ApplicationDetail';

// 管理员页面
import Admin from './pages/Admin';
import Dashboard from './pages/admin/Dashboard';
import BannerManagement from './pages/admin/BannerManagement';
import TrialManagement from './pages/admin/TrialManagement';
import ApplicationManagement from './pages/admin/ApplicationManagement';
import ArticleManagement from './pages/admin/ArticleManagement';
import UserManagement from './pages/admin/UserManagement';

// 受保护的路由组件
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// 公开路由组件（已登录用户不可访问）
const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

// 管理员路由组件
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  const { isAuthenticated, fetchProfile } = useAuthStore();

  useEffect(() => {
    // 如果已登录，获取最新的用户信息
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, fetchProfile]);

  return (
    <Routes>
      {/* 公开路由 */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="trial/:id" element={<TrialDetail />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:articleId" element={<Blog />} />
        
        {/* 认证路由 - 未登录用户可访问 */}
        <Route path="login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        
        {/* 受保护的路由 - 需要登录 */}
        <Route path="profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="applications" element={
          <ProtectedRoute>
            <Applications />
          </ProtectedRoute>
        } />
        <Route path="my-applications" element={
          <ProtectedRoute>
            <MyApplications />
          </ProtectedRoute>
        } />
        <Route path="applications/:id" element={
          <ProtectedRoute>
            <ApplicationDetail />
          </ProtectedRoute>
        } />
        <Route path="apply/:id" element={<Apply />} />
        
        {/* 404页面 */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600 mb-6">页面未找到</p>
              <a href="/" className="btn btn-primary">
                返回首页
              </a>
            </div>
          </div>
        } />
      </Route>
      
      {/* 管理员路由 */}
      <Route path="/admin" element={
        <AdminRoute>
          <Admin />
        </AdminRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="banners" element={<BannerManagement />} />
        <Route path="trials" element={<TrialManagement />} />
        <Route path="applications" element={<ApplicationManagement />} />
        <Route path="articles" element={<ArticleManagement />} />
        <Route path="users" element={<UserManagement />} />
      </Route>
    </Routes>
  );
}

export default App; 