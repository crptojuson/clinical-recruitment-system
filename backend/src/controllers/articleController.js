const { Article } = require('../models');
const { Op } = require('sequelize');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

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

// 上传Word文档并创建文章
const uploadWordDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请上传Word文档'
      });
    }

    const { title, author, category, summary, tags, featured } = req.body;
    
    if (!title || !author || !category) {
      // 清理上传的文件
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: '标题、作者和分类为必填项'
      });
    }

    try {
      // 使用mammoth将Word文档转换为HTML
      const result = await mammoth.convertToHtml({ path: req.file.path });
      const htmlContent = result.value;
      
      // 估算阅读时间（按每分钟200字计算）
      const textContent = htmlContent.replace(/<[^>]*>/g, '');
      const readTime = Math.max(1, Math.ceil(textContent.length / 200));

      // 创建文章
      const article = await Article.create({
        title,
        content: htmlContent,
        author,
        category,
        summary: summary || textContent.substring(0, 200) + '...',
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        featured: featured === 'true',
        readTime,
        publishDate: new Date(),
        isActive: true,
        views: 0
      });

      // 删除临时文件
      fs.unlinkSync(req.file.path);

      res.json({
        success: true,
        message: '文章创建成功',
        data: { article }
      });
    } catch (conversionError) {
      // 清理上传的文件
      fs.unlinkSync(req.file.path);
      console.error('Word文档转换失败:', conversionError);
      res.status(400).json({
        success: false,
        message: 'Word文档格式错误或转换失败'
      });
    }
  } catch (error) {
    // 清理上传的文件
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('上传Word文档失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 创建文章（传统方式）
const createArticle = async (req, res) => {
  try {
    const { title, content, author, category, summary, tags, featured, imageUrl } = req.body;
    
    if (!title || !content || !author || !category) {
      return res.status(400).json({
        success: false,
        message: '标题、内容、作者和分类为必填项'
      });
    }

    // 估算阅读时间
    const textContent = content.replace(/<[^>]*>/g, '');
    const readTime = Math.max(1, Math.ceil(textContent.length / 200));

    const article = await Article.create({
      title,
      content,
      author,
      category,
      summary: summary || textContent.substring(0, 200) + '...',
      tags: tags || [],
      featured: featured || false,
      imageUrl: imageUrl || null,
      readTime,
      publishDate: new Date(),
      isActive: true,
      views: 0
    });

    res.json({
      success: true,
      message: '文章创建成功',
      data: { article }
    });
  } catch (error) {
    console.error('创建文章失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 更新文章
const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, author, category, summary, tags, featured, imageUrl, isActive } = req.body;
    
    const article = await Article.findByPk(id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    // 如果内容有更新，重新计算阅读时间
    let readTime = article.readTime;
    if (content && content !== article.content) {
      const textContent = content.replace(/<[^>]*>/g, '');
      readTime = Math.max(1, Math.ceil(textContent.length / 200));
    }

    await article.update({
      title: title || article.title,
      content: content || article.content,
      author: author || article.author,
      category: category || article.category,
      summary: summary || article.summary,
      tags: tags !== undefined ? tags : article.tags,
      featured: featured !== undefined ? featured : article.featured,
      imageUrl: imageUrl !== undefined ? imageUrl : article.imageUrl,
      isActive: isActive !== undefined ? isActive : article.isActive,
      readTime
    });

    res.json({
      success: true,
      message: '文章更新成功',
      data: { article }
    });
  } catch (error) {
    console.error('更新文章失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 删除文章
const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    
    const article = await Article.findByPk(id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    await article.destroy();

    res.json({
      success: true,
      message: '文章删除成功'
    });
  } catch (error) {
    console.error('删除文章失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 获取所有文章（管理员）
const getAllArticles = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      isActive,
      search 
    } = req.query;
    
    const offset = (page - 1) * limit;
    const where = {};
    
    if (category && category !== '全部') {
      where.category = category;
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
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
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
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

module.exports = {
  getPublicArticles,
  getArticleById,
  incrementViews,
  getRelatedArticles,
  uploadWordDocument,
  createArticle,
  updateArticle,
  deleteArticle,
  getAllArticles
}; 