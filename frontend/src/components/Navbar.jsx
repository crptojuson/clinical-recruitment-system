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
        <div className="flex justify-between items-center h-12">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-1">
            <div className="w-6 h-6 bg-primary-600 rounded-lg flex items-center justify-center p-1">
              <img src={logoSvg} alt="Logo" className="w-full h-full" />
            </div>
            <span className="text-sm font-bold text-gray-900">试药通</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/"
              className={`text-xs font-medium transition-colors ${
                isActive('/') 
                  ? 'text-primary-600' 
                  : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              首页
            </Link>

            <Link
              to="/blog"
              className={`text-xs font-medium transition-colors ${
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
                  className={`text-xs font-medium transition-colors ${
                    isActive('/applications') 
                      ? 'text-primary-600' 
                      : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  我的报名
                </Link>
                
                <Link
                  to="/profile"
                  className={`text-xs font-medium transition-colors ${
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
                    className={`text-xs font-medium transition-colors ${
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
                  className="text-xs font-medium text-gray-700 hover:text-primary-600 transition-colors"
                >
                  退出
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-xs font-medium text-gray-700 hover:text-primary-600 transition-colors"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary text-xs px-3 py-1"
                >
                  注册
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-1 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-2 space-y-2">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className="block text-xs font-medium text-gray-700 px-2 py-1"
            >
              首页
            </Link>

            <Link
              to="/blog"
              onClick={() => setIsMenuOpen(false)}
              className="block text-xs font-medium text-gray-700 px-2 py-1"
            >
              健康资讯
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/applications"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-xs font-medium text-gray-700 px-2 py-1"
                >
                  我的报名
                </Link>
                
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-xs font-medium text-gray-700 px-2 py-1"
                >
                  个人中心
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="block text-xs font-medium text-danger-600 px-2 py-1 w-full text-left"
                >
                  退出登录
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-xs font-medium text-gray-700 px-2 py-1"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-xs font-medium text-primary-600 px-2 py-1"
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