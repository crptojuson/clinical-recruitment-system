const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  phone: {
    type: DataTypes.STRING(11),
    allowNull: false,
    unique: true,
    validate: {
      len: [11, 11],
      isNumeric: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  idCard: {
    type: DataTypes.STRING(18),
    allowNull: true,
    unique: true,
    validate: {
      len: [15, 18]
    }
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: [['男', '女']]
    }
  },
  birthday: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  height: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: 50,
      max: 250
    }
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: 20,
      max: 300
    }
  },
  bmi: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
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
  role: {
    type: DataTypes.STRING,
    defaultValue: 'user',
    validate: {
      isIn: [['user', 'agent', 'admin']]
    }
  },
  isAgent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  channelId: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true
  },
  referralCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalEarnings: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  referredBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'users',
  indexes: [
    {
      fields: ['phone']
    },
    {
      fields: ['channelId']
    },
    {
      fields: ['referredBy']
    }
  ]
});

// 自引用关联 - 推荐关系
User.belongsTo(User, { 
  as: 'referrer', 
  foreignKey: 'referredBy',
  onDelete: 'SET NULL'
});

User.hasMany(User, { 
  as: 'referrals', 
  foreignKey: 'referredBy',
  onDelete: 'SET NULL'
});

module.exports = User; 