const { validationResult } = require('express-validator');
const { Banner, Article, Trial, Application, User } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// ========== 横幅管理 ==========

// 获取所有横幅
const getBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll({
      order: [['order', 'ASC'], ['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { banners }
    });
  } catch (error) {
    console.error('获取横幅列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 创建横幅
const createBanner = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入数据有误',
        errors: errors.array()
      });
    }

    const banner = await Banner.create(req.body);

    res.status(201).json({
      success: true,
      message: '横幅创建成功',
      data: { banner }
    });
  } catch (error) {
    console.error('创建横幅失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 更新横幅
const updateBanner = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入数据有误',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const banner = await Banner.findByPk(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: '横幅不存在'
      });
    }

    await banner.update(req.body);

    res.json({
      success: true,
      message: '横幅更新成功',
      data: { banner }
    });
  } catch (error) {
    console.error('更新横幅失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 删除横幅
const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByPk(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: '横幅不存在'
      });
    }

    await banner.destroy();

    res.json({
      success: true,
      message: '横幅删除成功'
    });
  } catch (error) {
    console.error('删除横幅失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// ========== 博客管理 ==========

// 获取所有文章
const getArticles = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, featured, isActive } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (category) where.category = category;
    if (featured !== undefined) where.featured = featured === 'true';
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const { count, rows: articles } = await Article.findAndCountAll({
      where,
      order: [['publishDate', 'DESC']],
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

// 创建文章
const createArticle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入数据有误',
        errors: errors.array()
      });
    }

    const article = await Article.create(req.body);

    res.status(201).json({
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入数据有误',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const article = await Article.findByPk(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    await article.update(req.body);

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

// ========== 试验管理 ==========

// 获取所有试验（管理员视图）
const getTrialsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, city, disease, screeningSystem } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (city) where.city = city;
    if (disease) where.disease = disease;
    if (screeningSystem) where.screeningSystem = screeningSystem;

    const { count, rows: trials } = await Trial.findAndCountAll({
      where,
      include: [{
        model: Application,
        as: 'applications'
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    // 添加申请统计
    const trialsWithStats = trials.map(trial => ({
      ...trial.toJSON(),
      applicationCount: trial.applications?.length || 0,
      applications: undefined // 移除详细申请信息
    }));

    res.json({
      success: true,
      data: {
        trials: trialsWithStats,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取试验列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 创建试验
const createTrial = async (req, res) => {
  try {
    console.log('创建试验请求数据:', JSON.stringify(req.body, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('验证错误:', errors.array());
      return res.status(400).json({
        success: false,
        message: '输入数据有误',
        errors: errors.array()
      });
    }

    // 处理空值，设置默认值
    const trialData = { ...req.body };
    if (!trialData.genderRequirement || trialData.genderRequirement === '') {
      trialData.genderRequirement = '不限';
    }
    if (!trialData.participantType || trialData.participantType === '') {
      trialData.participantType = '健康者';
    }
    if (!trialData.screeningSystem || trialData.screeningSystem === '') {
      trialData.screeningSystem = '不联网项目';
    }
    
    // 处理空字符串为null
    ['currentSubjects', 'startDate', 'endDate', 'registrationStartDate', 'registrationDeadline', 'contactName', 'contactPhone', 'contactEmail', 'minBmi', 'maxBmi', 'totalSubjects'].forEach(field => {
      if (trialData[field] === '') {
        trialData[field] = null;
      }
    });

    console.log('开始创建试验...');
    const trial = await Trial.create(trialData);
    console.log('试验创建成功:', trial.toJSON());

    res.status(201).json({
      success: true,
      message: '试验创建成功',
      data: { trial }
    });
  } catch (error) {
    console.error('创建试验失败:', error);
    console.error('错误详情:', error.message);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};

// 更新试验
const updateTrial = async (req, res) => {
  try {
    console.log('收到的请求数据:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('验证错误:', errors.array());
      return res.status(400).json({
        success: false,
        message: '输入数据有误',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const trial = await Trial.findByPk(id);

    if (!trial) {
      return res.status(404).json({
        success: false,
        message: '试验不存在'
      });
    }

    // 处理空值，设置默认值
    const updateData = { ...req.body };
    if (!updateData.genderRequirement || updateData.genderRequirement === '') {
      updateData.genderRequirement = '不限';
    }
    if (!updateData.participantType || updateData.participantType === '') {
      updateData.participantType = '健康者';
    }
    if (!updateData.screeningSystem || updateData.screeningSystem === '') {
      updateData.screeningSystem = '不联网项目';
    }
    
    // 处理空字符串为null
    ['currentSubjects', 'startDate', 'endDate', 'registrationStartDate', 'registrationDeadline', 'contactName', 'contactPhone', 'contactEmail', 'minBmi', 'maxBmi', 'totalSubjects'].forEach(field => {
      if (updateData[field] === '') {
        updateData[field] = null;
      }
    });

    await trial.update(updateData);

    res.json({
      success: true,
      message: '试验更新成功',
      data: { trial }
    });
  } catch (error) {
    console.error('更新试验失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 删除试验
const deleteTrial = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const trial = await Trial.findByPk(id, { transaction });

    if (!trial) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: '试验不存在'
      });
    }

    // 检查是否有申请，如果有则先删除申请记录
    const applicationCount = await Application.count({ where: { trialId: id } });
    if (applicationCount > 0) {
      console.log(`删除试验 ${id} 的 ${applicationCount} 条申请记录`);
      await Application.destroy({ 
        where: { trialId: id },
        transaction
      });
    }

    // 删除试验项目
    await trial.destroy({ transaction });
    
    await transaction.commit();

    res.json({
      success: true,
      message: applicationCount > 0 
        ? `试验删除成功，同时删除了 ${applicationCount} 条相关申请记录`
        : '试验删除成功'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('删除试验失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// ========== 申请管理 ==========

// 获取所有申请
const getApplicationsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, trialId } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (trialId) where.trialId = trialId;

    const { count, rows: applications } = await Application.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'phone', 'role']
        },
        {
          model: Trial,
          as: 'trial',
          attributes: ['id', 'title', 'hospital', 'compensation']
        },
        {
          model: User,
          as: 'referrer',
          attributes: ['id', 'name', 'phone', 'channelId']
        }
      ],
      order: [['submittedAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取申请列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 更新申请状态
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      status, 
      reviewNotes, 
      medicalCheckDate, 
      medicalCheckStatus, 
      medicalCheckNotes,
      enrollmentDate,
      enrollmentStatus,
      pointsAwarded 
    } = req.body;

    const application = await Application.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'phone']
        },
        {
          model: User,
          as: 'referrer',
          attributes: ['id', 'name', 'phone', 'channelId']
        },
        {
          model: Trial,
          as: 'trial',
          attributes: ['id', 'title', 'hospital', 'compensation']
        }
      ]
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: '申请不存在'
      });
    }

    const updateData = {
      reviewedAt: new Date(),
      reviewedBy: req.user.id
    };

    // 更新状态
    if (status) updateData.status = status;
    if (reviewNotes) updateData.reviewNotes = reviewNotes;

    // 体检相关
    if (medicalCheckDate) updateData.medicalCheckDate = medicalCheckDate;
    if (medicalCheckStatus) updateData.medicalCheckStatus = medicalCheckStatus;
    if (medicalCheckNotes) updateData.medicalCheckNotes = medicalCheckNotes;

    // 入组相关
    if (enrollmentDate) updateData.enrollmentDate = enrollmentDate;
    if (enrollmentStatus) updateData.enrollmentStatus = enrollmentStatus;

    // 积分奖励
    if (pointsAwarded !== undefined) {
      updateData.pointsAwarded = pointsAwarded;
      if (pointsAwarded > 0) {
        updateData.pointsAwardedAt = new Date();
      }
    }

    await application.update(updateData);

    // 如果状态变更为enrolled（已入组），处理推荐奖励
    if (status === 'enrolled' && application.referrerId && application.trial) {
      const referralFee = application.trial.referralFee || 0;
      
      if (referralFee > 0) {
        // 更新推荐费状态
        await application.update({
          referralFeePaid: true,
          referralFeePaidAt: new Date()
        });

        // 更新推荐人收益
        await User.increment('totalEarnings', {
          by: referralFee,
          where: { id: application.referrerId }
        });
      }

      // 给推荐人增加积分（成功推荐奖励）
      const referralPoints = 100; // 成功推荐获得100积分
      await User.increment('totalEarnings', {
        by: referralPoints,
        where: { id: application.referrerId }
      });
    }

    // 重新获取更新后的数据
    const updatedApplication = await Application.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'phone']
        },
        {
          model: User,
          as: 'referrer', 
          attributes: ['id', 'name', 'phone', 'channelId']
        },
        {
          model: Trial,
          as: 'trial',
          attributes: ['id', 'title', 'hospital', 'compensation']
        }
      ]
    });

    res.json({
      success: true,
      message: '申请状态更新成功',
      data: { application: updatedApplication }
    });
  } catch (error) {
    console.error('更新申请状态失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 获取申请详情
const getApplicationDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'phone', 'role', 'avatar']
        },
        {
          model: User,
          as: 'referrer',
          attributes: ['id', 'name', 'phone', 'channelId']
        },
        {
          model: Trial,
          as: 'trial',
          attributes: ['id', 'title', 'hospital', 'compensation', 'referralFee', 'location']
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: '申请不存在'
      });
    }

    res.json({
      success: true,
      data: { application }
    });
  } catch (error) {
    console.error('获取申请详情失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 批量更新申请状态
const batchUpdateApplications = async (req, res) => {
  try {
    const { applicationIds, status, reviewNotes } = req.body;

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请选择要更新的申请'
      });
    }

    const updateData = {
      status,
      reviewNotes,
      reviewedAt: new Date(),
      reviewedBy: req.user.id
    };

    await Application.update(updateData, {
      where: { id: applicationIds }
    });

    // 如果状态为enrolled，处理推荐奖励
    if (status === 'enrolled') {
      const applications = await Application.findAll({
        where: { id: applicationIds },
        include: [
          {
            model: Trial,
            as: 'trial',
            attributes: ['referralFee']
          }
        ]
      });

      for (const app of applications) {
        if (app.referrerId && app.trial.referralFee > 0) {
          await app.update({
            referralFeePaid: true,
            referralFeePaidAt: new Date()
          });

          await User.increment('totalEarnings', {
            by: app.trial.referralFee,
            where: { id: app.referrerId }
          });
        }
      }
    }

    res.json({
      success: true,
      message: `成功更新 ${applicationIds.length} 个申请的状态`
    });
  } catch (error) {
    console.error('批量更新申请状态失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 获取申请统计信息
const getApplicationStats = async (req, res) => {
  try {
    const { trialId } = req.query;
    const where = {};
    if (trialId) where.trialId = trialId;

    const [
      totalApplications,
      pendingApplications,
      reviewingApplications,
      approvedApplications,
      rejectedApplications,
      medicalCheckApplications,
      enrolledApplications,
      completedApplications
    ] = await Promise.all([
      Application.count({ where }),
      Application.count({ where: { ...where, status: 'pending' } }),
      Application.count({ where: { ...where, status: 'reviewing' } }),
      Application.count({ where: { ...where, status: 'approved' } }),
      Application.count({ where: { ...where, status: 'rejected' } }),
      Application.count({ where: { ...where, status: 'medical_check' } }),
      Application.count({ where: { ...where, status: 'enrolled' } }),
      Application.count({ where: { ...where, status: 'completed' } })
    ]);

    res.json({
      success: true,
      data: {
        totalApplications,
        pendingApplications,
        reviewingApplications,
        approvedApplications,
        rejectedApplications,
        medicalCheckApplications,
        enrolledApplications,
        completedApplications
      }
    });
  } catch (error) {
    console.error('获取申请统计失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// ========== 统计数据 ==========

// 获取仪表板统计数据
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalTrials,
      activeTrials,
      totalApplications,
      pendingApplications,
      totalUsers,
      totalArticles
    ] = await Promise.all([
      Trial.count(),
      Trial.count({ where: { isActive: true, status: 'recruiting' } }),
      Application.count(),
      Application.count({ where: { status: 'submitted' } }),
      User.count({ where: { role: 'user' } }),
      Article.count({ where: { isActive: true } })
    ]);

    // 获取最近7天的申请统计
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentApplications = await Application.count({
      where: {
        submittedAt: {
          [Op.gte]: sevenDaysAgo
        }
      }
    });

    res.json({
      success: true,
      data: {
        totalTrials,
        activeTrials,
        totalApplications,
        pendingApplications,
        totalUsers,
        totalArticles,
        recentApplications
      }
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 更新文章状态
const updateArticleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const article = await Article.findByPk(id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    await article.update({ status });

    res.json({
      success: true,
      message: '文章状态更新成功',
      data: { article }
    });
  } catch (error) {
    console.error('更新文章状态失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 更新试验状态
const updateTrialStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const trial = await Trial.findByPk(id);
    if (!trial) {
      return res.status(404).json({
        success: false,
        message: '试验不存在'
      });
    }

    await trial.update({ status });

    res.json({
      success: true,
      message: '试验状态更新成功',
      data: { trial }
    });
  } catch (error) {
    console.error('更新试验状态失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 获取用户列表
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (role) where.role = role;
    if (status) where.status = status;

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 更新用户角色
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    await user.update({ role });

    res.json({
      success: true,
      message: '用户角色更新成功',
      data: { user: { ...user.toJSON(), password: undefined } }
    });
  } catch (error) {
    console.error('更新用户角色失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 更新用户状态
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    await user.update({ status });

    res.json({
      success: true,
      message: '用户状态更新成功',
      data: { user: { ...user.toJSON(), password: undefined } }
    });
  } catch (error) {
    console.error('更新用户状态失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

module.exports = {
  // 横幅管理
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  
  // 博客管理
  getArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  updateArticleStatus,
  
  // 试验管理
  getTrialsAdmin,
  createTrial,
  updateTrial,
  updateTrialStatus,
  deleteTrial,
  
  // 申请管理
  getApplicationsAdmin,
  updateApplicationStatus,
  getApplicationDetail,
  batchUpdateApplications,
  getApplicationStats,
  
  // 用户管理
  getUsers,
  updateUserRole,
  updateUserStatus,
  
  // 统计数据
  getDashboardStats
}; 