const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// 所有管理路由都需要管理员权限
router.use(authenticate);
router.use(requireAdmin);

// ========== 统计数据 ==========
router.get('/dashboard/stats', adminController.getDashboardStats);

// ========== 横幅管理 ==========
router.get('/banners', adminController.getBanners);

router.post('/banners', [
  body('title').notEmpty().withMessage('标题不能为空'),
  body('imageUrl').notEmpty().withMessage('图片链接不能为空'),
  body('order').optional().isInt({ min: 0 }).withMessage('排序必须是非负整数')
], adminController.createBanner);

router.put('/banners/:id', [
  body('title').notEmpty().withMessage('标题不能为空'),
  body('imageUrl').notEmpty().withMessage('图片链接不能为空'),
  body('order').optional().isInt({ min: 0 }).withMessage('排序必须是非负整数')
], adminController.updateBanner);

router.delete('/banners/:id', adminController.deleteBanner);

// ========== 博客管理 ==========
router.get('/articles', adminController.getArticles);

router.post('/articles', [
  body('title').notEmpty().withMessage('标题不能为空'),
  body('summary').notEmpty().withMessage('摘要不能为空'),
  body('content').notEmpty().withMessage('内容不能为空'),
  body('author').notEmpty().withMessage('作者不能为空'),
  body('category').notEmpty().withMessage('分类不能为空')
], adminController.createArticle);

router.put('/articles/:id', [
  body('title').notEmpty().withMessage('标题不能为空'),
  body('summary').notEmpty().withMessage('摘要不能为空'),
  body('content').notEmpty().withMessage('内容不能为空'),
  body('author').notEmpty().withMessage('作者不能为空'),
  body('category').notEmpty().withMessage('分类不能为空')
], adminController.updateArticle);

router.delete('/articles/:id', adminController.deleteArticle);

router.put('/articles/:id/status', [
  body('status').isIn(['draft', 'published', 'archived']).withMessage('无效的状态')
], adminController.updateArticleStatus);

// ========== 试验管理 ==========
router.get('/trials', adminController.getTrialsAdmin);

router.post('/trials', [
  body('participantType').optional().isIn(['健康者', '患者']).withMessage('参与者类型必须是健康者或患者'),
  body('compensation').optional().isFloat({ min: 0 }).withMessage('补偿金额必须是非负数'),
  body('referralFee').optional().isFloat({ min: 0 }).withMessage('推荐费必须是非负数'),
  body('currentSubjects').optional({ nullable: true, checkFalsy: true }).isInt({ min: 0 }).withMessage('已参与人数必须是非负整数'),
  body('registrationStartDate').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('报名开始时间格式无效'),
  body('registrationDeadline').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('报名截止时间格式无效'),
  body('startDate').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('试验开始时间格式无效'),
  body('endDate').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('试验结束时间格式无效')
], adminController.createTrial);

router.put('/trials/:id', [
  body('participantType').optional().isIn(['健康者', '患者']).withMessage('参与者类型必须是健康者或患者'),
  body('compensation').optional().isFloat({ min: 0 }).withMessage('补偿金额必须是非负数'),
  body('referralFee').optional().isFloat({ min: 0 }).withMessage('推荐费必须是非负数'),
  body('currentSubjects').optional({ nullable: true, checkFalsy: true }).isInt({ min: 0 }).withMessage('已参与人数必须是非负整数'),
  body('registrationStartDate').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('报名开始时间格式无效'),
  body('registrationDeadline').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('报名截止时间格式无效'),
  body('startDate').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('试验开始时间格式无效'),
  body('endDate').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('试验结束时间格式无效')
], adminController.updateTrial);

router.delete('/trials/:id', adminController.deleteTrial);

router.put('/trials/:id/status', [
  body('status').isIn(['recruiting', 'completed', 'paused', 'cancelled']).withMessage('无效的状态')
], adminController.updateTrialStatus);

// ========== 申请管理 ==========
router.get('/applications', adminController.getApplicationsAdmin);
router.get('/applications/stats', adminController.getApplicationStats);
router.get('/applications/:id', adminController.getApplicationDetail);
router.put('/applications/:id/status', adminController.updateApplicationStatus);
router.put('/applications/batch', adminController.batchUpdateApplications);

// ========== 用户管理 ==========
router.get('/users', adminController.getUsers);

router.put('/users/:id/role', [
  body('role').isIn(['user', 'agent', 'admin']).withMessage('无效的角色')
], adminController.updateUserRole);

router.put('/users/:id/status', [
  body('status').isIn(['active', 'banned', 'pending']).withMessage('无效的状态')
], adminController.updateUserStatus);

module.exports = router; 