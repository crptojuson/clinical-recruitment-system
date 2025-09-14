const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 注册
router.post('/register', [
  body('name').notEmpty().withMessage('姓名不能为空'),
  body('phone').isMobilePhone('zh-CN').withMessage('请输入有效的手机号'),
  body('password').isLength({ min: 6 }).withMessage('密码至少6位'),
  body('idCard').optional().isLength({ min: 18, max: 18 }).withMessage('身份证号码格式不正确'),
  body('height').optional().isNumeric().withMessage('身高必须是数字'),
  body('weight').optional().isNumeric().withMessage('体重必须是数字')
], authController.register);

// 登录
router.post('/login', [
  body('phone').isMobilePhone('zh-CN').withMessage('请输入有效的手机号'),
  body('password').notEmpty().withMessage('密码不能为空')
], authController.login);

// 获取当前用户信息
router.get('/profile', authenticate, authController.getProfile);

// 更新用户信息
router.put('/profile', authenticate, authController.updateProfile);

// 成为代理
router.post('/become-agent', authenticate, authController.becomeAgent);

// 验证推荐码
router.get('/validate-channel/:channelId', authController.validateChannel);

module.exports = router; 