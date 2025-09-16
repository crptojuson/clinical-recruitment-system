const express = require('express');
const articleController = require('../controllers/articleController');
const upload = require('../middleware/upload');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// 获取公开文章列表
router.get('/', articleController.getPublicArticles);

// 获取文章详情
router.get('/:id', articleController.getArticleById);

// 增加文章阅读量
router.post('/:id/views', articleController.incrementViews);

// 获取相关文章推荐
router.get('/:id/related', articleController.getRelatedArticles);

// 管理员功能 - 需要认证和管理员权限
// 上传Word文档并创建文章
router.post('/upload', authenticate, requireAdmin, upload.single('wordFile'), articleController.uploadWordDocument);

// 创建文章（传统方式）
router.post('/', authenticate, requireAdmin, articleController.createArticle);

// 更新文章
router.put('/:id', authenticate, requireAdmin, articleController.updateArticle);

// 删除文章
router.delete('/:id', authenticate, requireAdmin, articleController.deleteArticle);

// 获取所有文章（包括草稿）- 管理员
router.get('/admin/all', authenticate, requireAdmin, articleController.getAllArticles);

module.exports = router; 