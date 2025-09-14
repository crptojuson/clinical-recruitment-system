const express = require('express');
const articleController = require('../controllers/articleController');

const router = express.Router();

// 获取公开文章列表
router.get('/', articleController.getPublicArticles);

// 获取文章详情
router.get('/:id', articleController.getArticleById);

// 增加文章阅读量
router.post('/:id/views', articleController.incrementViews);

// 获取相关文章推荐
router.get('/:id/related', articleController.getRelatedArticles);

module.exports = router; 