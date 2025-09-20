const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Trial = sequelize.define('Trial', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  requirements: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  exclusionCriteria: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  admissionNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: true
  },
  compensation: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'recruiting',
    validate: {
      isIn: [['recruiting', 'active', 'inactive', 'completed', 'cancelled']]
    }
  },
  // 疾病类型
  disease: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // 参与者类型
  participantType: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '健康者',
    validate: {
      isIn: [['健康者', '患者']]
    }
  },
  // 试验地点
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  hospital: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // 年龄要求
  minAge: {
    type: DataTypes.INTEGER,
    validate: {
      min: 0,
      max: 150
    }
  },
  maxAge: {
    type: DataTypes.INTEGER,
    validate: {
      min: 0,
      max: 150
    }
  },
  // 性别要求
  genderRequirement: {
    type: DataTypes.STRING,
    defaultValue: '不限',
    validate: {
      isIn: [['不限', '男', '女']]
    }
  },
  // 筛选系统
  screeningSystem: {
    type: DataTypes.STRING,
    defaultValue: '不联网项目',
    validate: {
      isIn: [['太美', '中兴联网', '不联网项目']]
    }
  },
  // BMI要求
  minBmi: {
    type: DataTypes.FLOAT,
    validate: {
      min: 10,
      max: 50
    }
  },
  maxBmi: {
    type: DataTypes.FLOAT,
    validate: {
      min: 10,
      max: 50
    }
  },
  // 招募信息
  currentSubjects: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  // 推荐费用
  referralFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    validate: {
      min: 0
    }
  },
  // 时间安排
  startDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  registrationStartDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  registrationDeadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // 联系信息
  contactName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  contactPhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  contactEmail: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      customEmailValidation(value) {
        if (value && value !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          throw new Error('邮箱格式无效');
        }
      }
    }
  },
  // 其他信息
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  documents: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'trials',
  indexes: [
    {
      fields: ['status']
    },
    {
      fields: ['disease']
    },
    {
      fields: ['participantType']
    },
    {
      fields: ['city']
    },
    {
      fields: ['compensation']
    },
    {
      fields: ['featured']
    },
    {
      fields: ['screeningSystem']
    }
  ]
});

module.exports = Trial; 