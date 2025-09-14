const { Trial } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// 获取试验列表（支持搜索和筛选）
const getTrials = async (req, res) => {
  try {
      const {
    page = 1,
    limit = 10,
    keyword,
    disease,
    city,
    participantType,
    screeningSystem,
    compensationMin,
    compensationMax,
    status = 'recruiting'
  } = req.query;

    const offset = (page - 1) * limit;
    
    // 构建查询条件
    const whereConditions = {
      status,
      isActive: true
    };

    // 关键词搜索
    if (keyword) {
      whereConditions[Op.or] = [
        { title: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } },
        { hospital: { [Op.like]: `%${keyword}%` } }
      ];
    }

    // 疾病筛选
    if (disease) {
      whereConditions.disease = disease;
    }

    // 城市筛选
    if (city) {
      whereConditions.city = city;
    }

    // 参与者类型筛选
    if (participantType) {
      whereConditions.participantType = participantType;
    }

    // 筛选系统筛选
    if (screeningSystem) {
      whereConditions.screeningSystem = screeningSystem;
    }

    // 补贴范围筛选
    if (compensationMin || compensationMax) {
      whereConditions.compensation = {};
      if (compensationMin) {
        whereConditions.compensation[Op.gte] = compensationMin;
      }
      if (compensationMax) {
        whereConditions.compensation[Op.lte] = compensationMax;
      }
    }

    const { count, rows: trials } = await Trial.findAndCountAll({
      where: whereConditions,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [
        ['createdAt', 'DESC']
      ]
    });

    res.json({
      success: true,
      data: {
        trials,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('获取试验列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 获取试验详情
const getTrialById = async (req, res) => {
  try {
    const { id } = req.params;

    const trial = await Trial.findOne({
      where: {
        id,
        isActive: true
      }
    });

    if (!trial) {
      return res.status(404).json({
        success: false,
        message: '试验项目不存在'
      });
    }

    res.json({
      success: true,
      data: { trial }
    });

  } catch (error) {
    console.error('获取试验详情错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 获取疾病列表（用于筛选）
const getDiseases = async (req, res) => {
  try {
    const diseases = await Trial.findAll({
      attributes: ['disease'],
      where: {
        isActive: true,
        status: 'recruiting'
      },
      group: ['disease'],
      order: [['disease', 'ASC']]
    });

    const diseaseList = diseases.map(item => item.disease);

    res.json({
      success: true,
      data: { diseases: diseaseList }
    });

  } catch (error) {
    console.error('获取疾病列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 获取城市列表（用于筛选）
const getCities = async (req, res) => {
  try {
    const cities = await Trial.findAll({
      attributes: ['city'],
      where: {
        isActive: true,
        status: 'recruiting'
      },
      group: ['city'],
      order: [['city', 'ASC']]
    });

    const cityList = cities.map(item => item.city);

    res.json({
      success: true,
      data: { cities: cityList }
    });

  } catch (error) {
    console.error('获取城市列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 获取参与者类型列表（用于筛选）
const getParticipantTypes = async (req, res) => {
  try {
    const participantTypes = ['健康者', '患者'];

    res.json({
      success: true,
      data: { participantTypes }
    });

  } catch (error) {
    console.error('获取参与者类型列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 获取筛选系统列表（用于筛选）
const getScreeningSystems = async (req, res) => {
  try {
    const screeningSystems = ['太美', '中兴联网', '全国联网', '不联网项目'];

    res.json({
      success: true,
      data: { screeningSystems }
    });

  } catch (error) {
    console.error('获取筛选系统列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 创建试验项目（管理员）
const createTrial = async (req, res) => {
  try {
    // 验证用户权限
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入数据有误',
        errors: errors.array()
      });
    }

    const trialData = req.body;
    const trial = await Trial.create(trialData);

    res.status(201).json({
      success: true,
      message: '试验项目创建成功',
      data: { trial }
    });

  } catch (error) {
    console.error('创建试验项目错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 更新试验项目（管理员）
const updateTrial = async (req, res) => {
  try {
    // 验证用户权限
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足'
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const [affectedRows] = await Trial.update(updateData, {
      where: { id }
    });

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '试验项目不存在'
      });
    }

    const updatedTrial = await Trial.findByPk(id);

    res.json({
      success: true,
      message: '试验项目更新成功',
      data: { trial: updatedTrial }
    });

  } catch (error) {
    console.error('更新试验项目错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 删除试验项目（管理员）
const deleteTrial = async (req, res) => {
  try {
    // 验证用户权限
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足'
      });
    }

    const { id } = req.params;

    const affectedRows = await Trial.destroy({
      where: { id }
    });

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '试验项目不存在'
      });
    }

    res.json({
      success: true,
      message: '试验项目删除成功'
    });

  } catch (error) {
    console.error('删除试验项目错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 更新试验状态（管理员）
const updateTrialStatus = async (req, res) => {
  try {
    // 验证用户权限
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '权限不足'
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    const [affectedRows] = await Trial.update(
      { status },
      { where: { id } }
    );

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: '试验项目不存在'
      });
    }

    res.json({
      success: true,
      message: '试验状态更新成功'
    });

  } catch (error) {
    console.error('更新试验状态错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 获取热门推荐试验
const getFeaturedTrials = async (req, res) => {
  try {
    const trials = await Trial.findAll({
      where: {
        featured: true,
        status: 'active',
        isActive: true
      },
      limit: 6,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { trials }
    });

  } catch (error) {
    console.error('获取热门试验错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

module.exports = {
  getTrials,
  getTrialById,
  getDiseases,
  getCities,
  getParticipantTypes,
  getScreeningSystems,
  createTrial,
  updateTrial,
  deleteTrial,
  updateTrialStatus,
  getFeaturedTrials
}; 