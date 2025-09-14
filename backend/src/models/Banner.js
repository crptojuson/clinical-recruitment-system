const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Banner = sequelize.define('Banner', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subtitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  linkUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  linkText: {
    type: DataTypes.STRING,
    allowNull: true
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  backgroundColor: {
    type: DataTypes.STRING,
    defaultValue: '#3b82f6'
  },
  textColor: {
    type: DataTypes.STRING,
    defaultValue: '#ffffff'
  }
}, {
  tableName: 'banners',
  indexes: [
    {
      fields: ['order']
    },
    {
      fields: ['isActive']
    }
  ]
});

module.exports = Banner; 