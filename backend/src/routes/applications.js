const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate, optionalAuth } = require('../middleware/auth');
const {
  applyTrial,
  applyTrialPublic,
  getMyApplications,
  getApplicationDetail,
  getReferredApplications,
  getMyReferralStats,
  withdrawApplication
} = require('../controllers/applicationController');

// 公开报名路由（允许未登录用户）
router.post('/:trialId', optionalAuth, [
  body('name').notEmpty().withMessage('姓名不能为空'),
  body('phone').isMobilePhone('zh-CN').withMessage('请输入有效手机号'),
  body('idCard').isLength({ min: 18, max: 18 }).withMessage('请输入有效身份证号'),
  body('height').isFloat({ min: 50, max: 250 }).withMessage('身高范围50-250cm'),
  body('weight').isFloat({ min: 20, max: 300 }).withMessage('体重范围20-300kg')
], applyTrialPublic);

// 需要登录的路由
router.use(authenticate);

// 获取我的申请列表
router.get('/my/list', getMyApplications);

// 获取申请详情
router.get('/:id/detail', getApplicationDetail);

// 撤回申请
router.put('/:id/withdraw', withdrawApplication);

// 代理相关路由
router.get('/referrals/list', getReferredApplications);
router.get('/referrals/stats', getMyReferralStats);

module.exports = router; 