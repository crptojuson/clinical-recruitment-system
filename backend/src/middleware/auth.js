const jwt = require('jsonwebtoken');
const { User } = require('../models');

// 验证JWT令牌
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: '访问被拒绝，未提供令牌' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: '令牌无效或用户已被禁用' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('认证错误:', error);
    res.status(401).json({ 
      success: false, 
      message: '令牌无效' 
    });
  }
};

// 检查管理员权限
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: '需要管理员权限' 
    });
  }
  next();
};

// 检查代理或管理员权限
const requireAgentOrAdmin = (req, res, next) => {
  if (!['agent', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ 
      success: false, 
      message: '需要代理或管理员权限' 
    });
  }
  next();
};

// 可选认证（不强制要求登录）
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      const user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ['password'] }
      });
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // 忽略认证错误，继续处理请求
    next();
  }
};

// 生成JWT令牌
const generateToken = (userId) => {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
  );
};

module.exports = {
  authenticate,
  requireAdmin,
  requireAgentOrAdmin,
  optionalAuth,
  generateToken
}; 