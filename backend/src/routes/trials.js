const express = require('express');
const { body } = require('express-validator');
const trialController = require('../controllers/trialController');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// 获取疾病列表
router.get('/meta/diseases', trialController.getDiseases);

// 获取城市列表  
router.get('/meta/cities', trialController.getCities);

// 获取参与者类型列表
router.get('/meta/participant-types', trialController.getParticipantTypes);

// 获取筛选系统列表
router.get('/meta/screening-systems', trialController.getScreeningSystems);

// 获取热门推荐试验
router.get('/featured', trialController.getFeaturedTrials);

// 获取试验列表（前台）
router.get('/', trialController.getTrials);

// 获取试验详情
router.get('/:id', trialController.getTrialById);

// 以下是管理员接口
// 创建试验项目
router.post('/', authenticate, [
  body('participantType').optional().isIn(['健康者', '患者']).withMessage('参与者类型必须是健康者或患者'),
  body('compensation').optional().isNumeric().withMessage('补贴金额必须是数字'),
  body('totalSubjects').optional().isNumeric().withMessage('总招募人数必须是数字')
], trialController.createTrial);

// 更新试验项目
router.put('/:id', authenticate, trialController.updateTrial);

// 删除试验项目
router.delete('/:id', authenticate, trialController.deleteTrial);

// 更新试验状态
router.patch('/:id/status', authenticate, trialController.updateTrialStatus);

module.exports = router; 