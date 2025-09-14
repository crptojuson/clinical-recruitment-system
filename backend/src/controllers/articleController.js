const { Article } = require('../models');
const { Op } = require('sequelize');

// 获取公开文章列表
const getPublicArticles = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      featured, 
      search 
    } = req.query;
    
    const offset = (page - 1) * limit;

    const where = {
      isActive: true  // 只显示激活的文章
    };
    
    if (category && category !== '全部') {
      where.category = category;
    }
    
    if (featured !== undefined) {
      where.featured = featured === 'true';
    }
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { summary: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: articles } = await Article.findAndCountAll({
      where,
      order: [['publishDate', 'DESC']],
      limit: parseInt(limit),
      offset,
      attributes: [
        'id', 'title', 'summary', 'author', 'category', 
        'tags', 'featured', 'publishDate', 'readTime', 
        'views', 'imageUrl', 'createdAt'
      ]
    });

    res.json({
      success: true,
      data: {
        articles,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取文章列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 获取文章详情
const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const article = await Article.findOne({
      where: { 
        id, 
        isActive: true 
      }
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    res.json({
      success: true,
      data: { article }
    });
  } catch (error) {
    console.error('获取文章详情失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 增加文章阅读量
const incrementViews = async (req, res) => {
  try {
    const { id } = req.params;
    
    const article = await Article.findOne({
      where: { 
        id, 
        isActive: true 
      }
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    await article.increment('views');

    res.json({
      success: true,
      data: { 
        views: article.views + 1 
      }
    });
  } catch (error) {
    console.error('更新阅读量失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 获取相关文章推荐
const getRelatedArticles = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 4 } = req.query;
    
    // 先获取当前文章的分类
    const currentArticle = await Article.findOne({
      where: { id, isActive: true },
      attributes: ['category']
    });

    if (!currentArticle) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    // 获取同分类的其他文章
    const relatedArticles = await Article.findAll({
      where: {
        id: { [Op.ne]: id },
        category: currentArticle.category,
        isActive: true
      },
      order: [['publishDate', 'DESC']],
      limit: parseInt(limit),
      attributes: [
        'id', 'title', 'summary', 'author', 'category', 
        'publishDate', 'readTime', 'views', 'imageUrl'
      ]
    });

    res.json({
      success: true,
      data: { articles: relatedArticles }
    });
  } catch (error) {
    console.error('获取相关文章失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

module.exports = {
  getPublicArticles,
  getArticleById,
  incrementViews,
  getRelatedArticles
}; 