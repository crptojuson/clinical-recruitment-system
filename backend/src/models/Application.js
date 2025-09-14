const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true, // 允许未注册用户申请
    references: {
      model: 'users',
      key: 'id'
    }
  },
  trialId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'trials',
      key: 'id'
    }
  },
  referrerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  // 申请人基本信息
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(11),
    allowNull: false
  },
  idCard: {
    type: DataTypes.STRING(18),
    allowNull: false
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['男', '女']]
    }
  },
  birthday: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  // 身体信息
  height: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 50,
      max: 250
    }
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 20,
      max: 300
    }
  },
  bmi: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  // 医疗信息
  medicalHistory: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  currentMedications: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  allergies: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // 吸烟状态
  smokingStatus: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '不吸烟',
    validate: {
      isIn: [['不吸烟', '偶尔吸烟', '经常吸烟', '已戒烟']]
    }
  },
  // 疾病史
  diseases: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('diseases');
      if (!value) return [];
      try {
        return JSON.parse(value);
      } catch (error) {
        console.warn('Failed to parse diseases JSON:', value, error);
        return [];
      }
    },
    set(value) {
      this.setDataValue('diseases', JSON.stringify(value || []));
    }
  },
  // 推荐码
  channelId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // 申请状态 - 完善状态管理
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'reviewing', 'approved', 'rejected', 'medical_check', 'enrolled', 'completed', 'withdrawn', 'failed']]
    }
  },
  // 审核信息
  reviewNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '审核备注'
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '审核时间'
  },
  reviewedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: '审核人ID'
  },
  // 体检相关
  medicalCheckDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '体检时间'
  },
  medicalCheckStatus: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: [['pending', 'scheduled', 'completed', 'failed']]
    },
    comment: '体检状态'
  },
  medicalCheckNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '体检备注'
  },
  // 入组相关
  enrollmentDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '入组时间'
  },
  enrollmentStatus: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: [['pending', 'enrolled', 'failed']]
    },
    comment: '入组状态'
  },
  // 推荐奖励信息
  referralFeeAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: '推荐费金额'
  },
  referralFeePaid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '推荐费是否已支付'
  },
  referralFeePaidAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '推荐费支付时间'
  },
  // 积分奖励
  pointsAwarded: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '获得积分'
  },
  pointsAwardedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '积分奖励时间'
  },
  // 其他信息
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '备注信息'
  },
  documents: {
    type: DataTypes.TEXT,
    get() {
      const value = this.getDataValue('documents');
      if (!value) return [];
      try {
        return JSON.parse(value);
      } catch (error) {
        console.warn('Failed to parse documents JSON:', value, error);
        return [];
      }
    },
    set(value) {
      this.setDataValue('documents', JSON.stringify(value || []));
    },
    comment: '相关文档'
  },
  submittedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: '提交时间'
  },
  // 联系信息
  emergencyContact: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '紧急联系人'
  },
  emergencyPhone: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '紧急联系电话'
  }
}, {
  tableName: 'applications',
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['trialId']
    },
    {
      fields: ['referrerId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['submittedAt']
    },
    {
      fields: ['medicalCheckStatus']
    },
    {
      fields: ['enrollmentStatus']
    },
    // 注意：不能在数据库层面对包含null的字段设置唯一约束
    // 已登录用户的重复报名检查在应用层处理
  ]
});

module.exports = Application; 