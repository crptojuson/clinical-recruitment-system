import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, FileText, LogOut, BookOpen } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import logoSvg from '../assets/images/logo.svg';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout, isAdmin } = useAuthStore();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center p-1">
              <img src={logoSvg} alt="Logo" className="w-full h-full" />
            </div>
            <span className="text-xl font-bold text-gray-900">试药通</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-primary-600' 
                  : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              首页
            </Link>

            <Link
              to="/blog"
              className={`text-sm font-medium transition-colors ${
                location.pathname.startsWith('/blog') 
                  ? 'text-primary-600' 
                  : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              健康资讯
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/applications"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/applications') 
                      ? 'text-primary-600' 
                      : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  我的报名
                </Link>
                
                <Link
                  to="/profile"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/profile') 
                      ? 'text-primary-600' 
                      : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  个人中心
                </Link>

                {isAdmin() && (
                  <Link
                    to="/admin"
                    className={`text-sm font-medium transition-colors ${
                      location.pathname.startsWith('/admin') 
                        ? 'text-primary-600' 
                        : 'text-gray-700 hover:text-primary-600'
                    }`}
                  >
                    后台管理
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                >
                  退出
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                >
                  注册
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-4">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="block text-sm font-medium text-gray-700"
            >
              首页
            </Link>

            <Link
              to="/blog"
              onClick={() => setIsMenuOpen(false)}
              className="block text-sm font-medium text-gray-700"
            >
              健康资讯
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/applications"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-sm font-medium text-gray-700"
                >
                  我的报名
                </Link>
                
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-sm font-medium text-gray-700"
                >
                  个人中心
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="block text-sm font-medium text-danger-600"
                >
                  退出登录
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-sm font-medium text-gray-700"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-sm font-medium text-primary-600"
                >
                  注册
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 