const { User } = require('../models');
const { generateToken } = require('../middleware/auth');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

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

// 生成channelId的辅助函数
const generateChannelId = (userId) => {
  return userId.toString() + Date.now().toString().slice(-4);
};

// 用户注册
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入数据有误',
        errors: errors.array()
      });
    }

    const { name, phone, password, idCard, height, weight, channelId } = req.body;

    // 检查手机号是否已存在
    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '该手机号已被注册'
      });
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 12);

    // 准备用户数据
    const userData = {
      name,
      phone,
      password: hashedPassword,
      idCard,
      height,
      weight
    };

    // 计算年龄和BMI
    if (idCard) {
      userData.birthday = new Date(
        parseInt(idCard.substring(6, 10)),
        parseInt(idCard.substring(10, 12)) - 1,
        parseInt(idCard.substring(12, 14))
      );
      userData.gender = parseInt(idCard.substring(16, 17)) % 2 === 0 ? '女' : '男';
    }

    if (height && weight) {
      userData.bmi = calculateBMI(height, weight);
    }

    // 处理推荐关系
    if (channelId) {
      const referrer = await User.findOne({ where: { channelId } });
      if (referrer) {
        userData.referredBy = referrer.id;
      }
    }

    const user = await User.create(userData);

    // 生成JWT令牌
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          isAgent: user.isAgent
        }
      }
    });

  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 用户登录
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '输入数据有误',
        errors: errors.array()
      });
    }

    const { phone, password } = req.body;

    // 查找用户
    const user = await User.findOne({ where: { phone } });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: '密码错误'
      });
    }

    // 生成JWT令牌
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          isAgent: user.isAgent,
          channelId: user.channelId
        }
      }
    });

  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 获取用户信息
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: User,
          as: 'referrer',
          attributes: ['id', 'name', 'phone']
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 更新用户信息
const updateProfile = async (req, res) => {
  try {
    const { name, idCard, height, weight, smokingStatus, diseases, medicalHistory, currentMedications, allergies } = req.body;

    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (idCard !== undefined) updateData.idCard = idCard;
    if (height !== undefined) updateData.height = height;
    if (weight !== undefined) updateData.weight = weight;
    if (smokingStatus !== undefined) updateData.smokingStatus = smokingStatus;
    if (diseases !== undefined) updateData.diseases = diseases;
    if (medicalHistory !== undefined) updateData.medicalHistory = medicalHistory;
    if (currentMedications !== undefined) updateData.currentMedications = currentMedications;
    if (allergies !== undefined) updateData.allergies = allergies;

    // 重新计算BMI
    if (height !== undefined || weight !== undefined) {
      const user = await User.findByPk(req.user.id);
      const newHeight = height !== undefined ? height : user.height;
      const newWeight = weight !== undefined ? weight : user.weight;
      if (newHeight && newWeight) {
        updateData.bmi = calculateBMI(newHeight, newWeight);
      }
    }

    // 从身份证号更新性别和生日
    if (idCard) {
      updateData.birthday = new Date(
        parseInt(idCard.substring(6, 10)),
        parseInt(idCard.substring(10, 12)) - 1,
        parseInt(idCard.substring(12, 14))
      );
      updateData.gender = parseInt(idCard.substring(16, 17)) % 2 === 0 ? '女' : '男';
    }

    await User.update(updateData, {
      where: { id: req.user.id }
    });

    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      message: '用户信息更新成功',
      data: { user: updatedUser }
    });

  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 成为代理
const becomeAgent = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    if (user.isAgent) {
      return res.status(400).json({
        success: false,
        message: '您已经是代理了'
      });
    }

    // 生成channelId并更新用户
    const channelId = generateChannelId(user.id);
    
    await User.update({
      isAgent: true,
      role: 'agent',
      channelId: channelId
    }, {
      where: { id: user.id }
    });

    res.json({
      success: true,
      message: '恭喜您成为代理！',
      data: {
        channelId: channelId,
        role: 'agent',
        isAgent: true
      }
    });

  } catch (error) {
    console.error('成为代理错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 验证推荐码
const validateChannel = async (req, res) => {
  try {
    const { channelId } = req.params;

    const agent = await User.findOne({
      where: { channelId },
      attributes: ['id', 'name', 'phone', 'isAgent']
    });

    if (!agent || !agent.isAgent) {
      return res.status(404).json({
        success: false,
        message: '推荐码无效'
      });
    }

    res.json({
      success: true,
      data: {
        agent: {
          id: agent.id,
          name: agent.name,
          phone: agent.phone
        }
      }
    });

  } catch (error) {
    console.error('验证推荐码错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  becomeAgent,
  validateChannel
}; 