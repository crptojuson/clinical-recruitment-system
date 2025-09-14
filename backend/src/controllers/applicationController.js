const { Application, Trial, User } = require('../models');
const { validationResult } = require('express-validator');
const { sequelize } = require('../config/database');

// 计算年龄的辅助函数
const calculateAge = (idCard) => {
  if (!idCard || idCard.length < 18) return null;
  const year = parseInt(idCard.substring(6, 10));
  const month = parseInt(idCard.substring(10, 12));
  const day = parseInt(idCard.substring(12, 14));
  const birthday = new Date(year, month - 1, day);
  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const monthDiff = today.getMonth() - birthday.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
    age--;
  }
  return age;
};

// 计算BMI的辅助函数
const calculateBMI = (height, weight) => {
  if (!height || !weight) return null;
  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
};

// 报名试验
const applyTrial = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入数据有误',
        errors: errors.array()
      });
    }

    const { trialId } = req.params;
    const {
      name,
      phone,
      idCard,
      height,
      weight,
      smokingStatus,
      diseases,
      medicalHistory,
      currentMedications,
      allergies,
      channelId
    } = req.body;

    // 检查试验是否存在且可报名
    const trial = await Trial.findOne({
      where: {
        id: trialId,
        status: 'recruiting',
        isActive: true
      }
    });

    if (!trial) {
      return res.status(404).json({
        success: false,
        message: '试验项目不存在或已关闭报名'
      });
    }

    // 检查报名是否已截止
    if (trial.registrationDeadline && new Date() > new Date(trial.registrationDeadline)) {
      return res.status(400).json({
        success: false,
        message: '报名已截止'
      });
    }

    // 检查试验是否已结束
    if (trial.endDate && new Date() > new Date(trial.endDate)) {
      return res.status(400).json({
        success: false,
        message: '试验已结束'
      });
    }

    // 检查用户是否已报名该试验（仅对登录用户检查）
    if (req.user) {
      const existingApplication = await Application.findOne({
        where: {
          userId: req.user.id,
          trialId: trialId
        }
      });

      if (existingApplication) {
        return res.status(400).json({
          success: false,
          message: '您已报名该试验项目'
        });
      }

      // 检查用户是否已报名其他地区的项目
      const userApplications = await Application.findAll({
        where: {
          userId: req.user.id
        },
        include: [{
          model: Trial,
          as: 'trial',
          attributes: ['city']
        }]
      });

      if (userApplications.length > 0) {
        const existingCity = userApplications[0].trial.city;
        if (existingCity && trial.city && existingCity !== trial.city) {
          return res.status(400).json({
            success: false,
            message: `您已报名${existingCity}地区的项目，不能同时报名其他地区的项目`
          });
        }
      }
    }

    // 计算年龄和BMI
    const age = calculateAge(idCard);
    const bmi = calculateBMI(height, weight);
    const gender = parseInt(idCard.substring(16, 17)) % 2 === 0 ? '女' : '男';
    const birthday = new Date(
      parseInt(idCard.substring(6, 10)),
      parseInt(idCard.substring(10, 12)) - 1,
      parseInt(idCard.substring(12, 14))
    );

    // 准备申请数据
    const applicationData = {
      userId: req.user ? req.user.id : null,
      trialId: trialId,
      name,
      phone,
      idCard,
      gender,
      birthday,
      age,
      height,
      weight,
      bmi,
      smokingStatus: smokingStatus || '不吸烟',
      diseases: diseases || [],
      medicalHistory,
      currentMedications,
      allergies,
      referralFeeAmount: trial.referralFee || 0
    };

    // 处理推荐关系
    if (channelId) {
      const referrer = await User.findOne({
        where: { channelId, isAgent: true }
      });
      if (referrer) {
        applicationData.referrerId = referrer.id;
      }
    }

    const application = await Application.create(applicationData);

    // 更新试验的当前申请人数
    await Trial.update(
      { currentSubjects: trial.currentSubjects + 1 },
      { where: { id: trialId } }
    );

    // 如果有推荐人，更新推荐人的推荐数量
    if (applicationData.referrerId) {
      await User.increment('referralCount', {
        by: 1,
        where: { id: applicationData.referrerId }
      });
    }

    res.status(201).json({
      success: true,
      message: '报名成功',
      data: { application }
    });

  } catch (error) {
    console.error('报名试验错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 获取我的申请列表
const getMyApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const where = { userId: req.user.id };
    if (status) where.status = status;

    const { count, rows: applications } = await Application.findAndCountAll({
      where,
      include: [
        {
          model: Trial,
          as: 'trial',
          attributes: [
            'id', 'title', 'compensation', 'referralFee', 'location', 'status',
            'disease', 'participantType', 'city', 'hospital', 'duration'
          ]
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

    // 增强数据：判断是本人申请还是代理申请
    const enhancedApplications = applications.map(app => {
      const appData = app.toJSON();
      
      // 判断申请类型：
      // 1. 如果申请人姓名与当前用户姓名相同，则为本人申请
      // 2. 如果不同，则为代理申请
      const isProxyApplication = appData.name !== req.user.name;
      
      return {
        ...appData,
        applicationType: isProxyApplication ? 'proxy' : 'self',
        applicantName: appData.name, // 实际申请人姓名
        applicantPhone: appData.phone, // 实际申请人电话
        currentUserName: req.user.name, // 当前登录用户姓名
        referralFeeAmount: appData.referralFeeAmount || appData.trial?.referralFee || 0
      };
    });

    res.json({
      success: true,
      data: {
        applications: enhancedApplications,
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

// 获取申请详情
const getApplicationDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const application = await Application.findByPk(id, {
      include: [
        {
          model: Trial,
          as: 'trial',
          attributes: ['id', 'title', 'hospital', 'compensation', 'referralFee', 'location', 'status', 'description']
        },
        {
          model: User,
          as: 'referrer',
          attributes: ['id', 'name', 'phone', 'channelId']
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

    // 检查权限：只有申请人本人、推荐人或管理员可以查看
    const canView = application.userId === userId || 
                   application.referrerId === userId || 
                   req.user?.role === 'admin';

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: '无权查看此申请'
      });
    }

    // 获取状态进度
    const statusProgress = getStatusProgress(application.status);

    res.json({
      success: true,
      data: { 
        application,
        statusProgress
      }
    });
  } catch (error) {
    console.error('获取申请详情失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 获取推荐的申请列表（代理查看）
const getReferredApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const where = { referrerId: req.user.id };
    if (status) where.status = status;

    const { count, rows: applications } = await Application.findAndCountAll({
      where,
      include: [
        {
          model: Trial,
          as: 'trial',
          attributes: ['id', 'title', 'hospital', 'compensation', 'referralFee', 'location']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'phone']
        }
      ],
      order: [['submittedAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    // 计算收益统计
    const totalEarnings = await Application.sum('referralFeeAmount', {
      where: { 
        referrerId: req.user.id, 
        referralFeePaid: true 
      }
    });

    const pendingEarnings = await Application.sum('referralFeeAmount', {
      where: { 
        referrerId: req.user.id, 
        status: 'enrolled',
        referralFeePaid: false
      }
    });

    res.json({
      success: true,
      data: {
        applications,
        earnings: {
          total: totalEarnings || 0,
          pending: pendingEarnings || 0
        },
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取推荐申请列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 获取我的推荐统计
const getMyReferralStats = async (req, res) => {
  try {
    const referrerId = req.user.id;

    const [
      totalReferrals,
      pendingReferrals,
      approvedReferrals,
      enrolledReferrals,
      totalEarnings,
      pendingEarnings
    ] = await Promise.all([
      Application.count({ where: { referrerId } }),
      Application.count({ where: { referrerId, status: 'pending' } }),
      Application.count({ where: { referrerId, status: 'approved' } }),
      Application.count({ where: { referrerId, status: 'enrolled' } }),
      Application.sum('referralFeeAmount', { 
        where: { referrerId, referralFeePaid: true } 
      }),
      Application.sum('referralFeeAmount', { 
        where: { referrerId, status: 'enrolled', referralFeePaid: false } 
      })
    ]);

    res.json({
      success: true,
      data: {
        totalReferrals: totalReferrals || 0,
        pendingReferrals: pendingReferrals || 0,
        approvedReferrals: approvedReferrals || 0,
        enrolledReferrals: enrolledReferrals || 0,
        totalEarnings: totalEarnings || 0,
        pendingEarnings: pendingEarnings || 0
      }
    });
  } catch (error) {
    console.error('获取推荐统计失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 撤回申请
const withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const application = await Application.findByPk(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: '申请不存在'
      });
    }

    // 检查权限
    if (application.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '无权操作此申请'
      });
    }

    // 检查是否可以撤回
    if (!['pending', 'reviewing', 'approved'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: '当前状态无法撤回申请'
      });
    }

    await application.update({
      status: 'withdrawn',
      notes: reason || '用户主动撤回',
      reviewedAt: new Date()
    });

    res.json({
      success: true,
      message: '申请已撤回'
    });
  } catch (error) {
    console.error('撤回申请失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 获取状态进度辅助函数
const getStatusProgress = (status) => {
  const steps = [
    { key: 'pending', label: '待审核', completed: false },
    { key: 'reviewing', label: '审核中', completed: false },
    { key: 'approved', label: '已通过', completed: false },
    { key: 'medical_check', label: '体检阶段', completed: false },
    { key: 'enrolled', label: '已入组', completed: false },
    { key: 'completed', label: '已完成', completed: false }
  ];

  const statusOrder = ['pending', 'reviewing', 'approved', 'medical_check', 'enrolled', 'completed'];
  const currentIndex = statusOrder.indexOf(status);

  if (status === 'rejected' || status === 'withdrawn' || status === 'failed') {
    return {
      steps,
      currentStep: status,
      isCompleted: false,
      isFailed: true
    };
  }

  steps.forEach((step, index) => {
    if (index <= currentIndex) {
      step.completed = true;
    }
  });

  return {
    steps,
    currentStep: status,
    isCompleted: status === 'completed',
    isFailed: false
  };
};

// 公开报名试验（允许未注册用户）
const applyTrialPublic = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    // 确保禁用外键约束
    await sequelize.query('PRAGMA foreign_keys = OFF;', { transaction });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入数据有误',
        errors: errors.array()
      });
    }

    const { trialId } = req.params;
    const {
      name,
      phone,
      idCard,
      height,
      weight,
      smokingStatus,
      diseases,
      medicalHistory,
      currentMedications,
      allergies,
      channelId
    } = req.body;

    // 检查试验是否存在且可报名
    const trial = await Trial.findOne({
      where: {
        id: trialId,
        status: 'recruiting',
        isActive: true
      }
    });

    if (!trial) {
      return res.status(404).json({
        success: false,
        message: '试验项目不存在或已关闭报名'
      });
    }

    // 检查报名是否已截止
    if (trial.registrationDeadline && new Date() > new Date(trial.registrationDeadline)) {
      return res.status(400).json({
        success: false,
        message: '报名已截止'
      });
    }

    // 检查试验是否已结束
    if (trial.endDate && new Date() > new Date(trial.endDate)) {
      return res.status(400).json({
        success: false,
        message: '试验已结束'
      });
    }

    // 计算年龄和BMI
    const age = calculateAge(idCard);
    const bmi = calculateBMI(height, weight);
    const gender = parseInt(idCard.substring(16, 17)) % 2 === 0 ? '女' : '男';
    const birthday = new Date(
      parseInt(idCard.substring(6, 10)),
      parseInt(idCard.substring(10, 12)) - 1,
      parseInt(idCard.substring(12, 14))
    );

    // 检查是否已有相同身份证的申请
    const existingApplication = await Application.findOne({
      where: {
        idCard: idCard,
        trialId: trialId
      }
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: '此身份证号已报名该试验项目'
      });
    }

    // 检查地区限制 - 通过身份证号查找该用户的所有申请
    const userApplicationsByIdCard = await Application.findAll({
      where: {
        idCard: idCard
      },
      include: [{
        model: Trial,
        as: 'trial',
        attributes: ['city']
      }]
    });

    if (userApplicationsByIdCard.length > 0) {
      const existingCity = userApplicationsByIdCard[0].trial.city;
      if (existingCity && trial.city && existingCity !== trial.city) {
        return res.status(400).json({
          success: false,
          message: `您已报名${existingCity}地区的项目，不能同时报名其他地区的项目`
        });
      }
    }

    // 如果用户已登录，检查是否已报名
    if (req.user) {
      const userApplication = await Application.findOne({
        where: {
          userId: req.user.id,
          trialId: trialId
        }
      });

      if (userApplication) {
        return res.status(400).json({
          success: false,
          message: '您已报名该试验项目'
        });
      }

      // 检查已登录用户的地区限制
      const userApplicationsByUserId = await Application.findAll({
        where: {
          userId: req.user.id
        },
        include: [{
          model: Trial,
          as: 'trial',
          attributes: ['city']
        }]
      });

      if (userApplicationsByUserId.length > 0) {
        const existingCity = userApplicationsByUserId[0].trial.city;
        if (existingCity && trial.city && existingCity !== trial.city) {
          return res.status(400).json({
            success: false,
            message: `您已报名${existingCity}地区的项目，不能同时报名其他地区的项目`
          });
        }
      }
    }

    // 准备申请数据
    const applicationData = {
      userId: req.user ? req.user.id : null, // 如果未登录则为null
      trialId: trialId,
      name,
      phone,
      idCard,
      gender,
      age,
      birthday,
      height: parseFloat(height),
      weight: parseFloat(weight),
      bmi: parseFloat(bmi.toFixed(1)),
      smokingStatus: smokingStatus || '不吸烟',
      diseases: diseases || [],
      medicalHistory: medicalHistory || '',
      currentMedications: currentMedications || '',
      allergies: allergies || '',
      channelId: channelId || null,
      status: 'pending'
    };

    // 创建申请记录
    const application = await Application.create(applicationData, { transaction });

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: '报名成功',
      data: { application }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('公开报名试验错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

module.exports = {
  applyTrial,
  applyTrialPublic,
  getMyApplications,
  getApplicationDetail,
  getReferredApplications,
  getMyReferralStats,
  withdrawApplication
}; 