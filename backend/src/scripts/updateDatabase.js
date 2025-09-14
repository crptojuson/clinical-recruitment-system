require('dotenv').config();
const { sequelize } = require('../config/database');
const { User, Application } = require('../models');

const updateDatabase = async () => {
  try {
    console.log('开始更新数据库结构...');

    // 检查并添加用户表的新字段
    try {
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN smokingStatus TEXT DEFAULT '不吸烟'
      `);
      console.log('用户表添加吸烟状态字段');
    } catch (error) {
      if (!error.message.includes('duplicate column name')) {
        throw error;
      }
      console.log('用户表吸烟状态字段已存在');
    }

    try {
      await sequelize.query(`
        ALTER TABLE users 
        ADD COLUMN diseases TEXT DEFAULT NULL
      `);
      console.log('用户表添加疾病字段');
    } catch (error) {
      if (!error.message.includes('duplicate column name')) {
        throw error;
      }
      console.log('用户表疾病字段已存在');
    }

    // 检查并添加申请表的新字段
    try {
      await sequelize.query(`
        ALTER TABLE applications 
        ADD COLUMN smokingStatus TEXT DEFAULT '不吸烟'
      `);
      console.log('申请表添加吸烟状态字段');
    } catch (error) {
      if (!error.message.includes('duplicate column name')) {
        throw error;
      }
      console.log('申请表吸烟状态字段已存在');
    }

    try {
      await sequelize.query(`
        ALTER TABLE applications 
        ADD COLUMN diseases TEXT DEFAULT NULL
      `);
      console.log('申请表添加疾病字段');
    } catch (error) {
      if (!error.message.includes('duplicate column name')) {
        throw error;
      }
      console.log('申请表疾病字段已存在');
    }

    // 检查并添加推荐码字段
    try {
      await sequelize.query(`
        ALTER TABLE applications 
        ADD COLUMN channelId TEXT DEFAULT NULL
      `);
      console.log('申请表添加推荐码字段');
    } catch (error) {
      if (!error.message.includes('duplicate column name')) {
        throw error;
      }
      console.log('申请表推荐码字段已存在');
    }

    // 检查并添加试验表的入院说明字段
    try {
      await sequelize.query(`
        ALTER TABLE trials 
        ADD COLUMN admissionNotes TEXT DEFAULT NULL
      `);
      console.log('试验表添加入院说明字段');
    } catch (error) {
      if (!error.message.includes('duplicate column name')) {
        throw error;
      }
      console.log('试验表入院说明字段已存在');
    }

    console.log('数据库结构更新完成');

  } catch (error) {
    console.error('更新数据库失败:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

updateDatabase(); 