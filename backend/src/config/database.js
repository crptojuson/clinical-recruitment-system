const { Sequelize } = require('sequelize');
const path = require('path');

// 创建Sequelize实例
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: console.log, // 可以设置为false关闭SQL日志
  dialectOptions: {
    // 启用外键约束
    options: {
      enableForeignKeyConstraints: false
    }
  },
  define: {
    timestamps: true, // 自动添加createdAt和updatedAt
    underscored: false, // 使用camelCase而不是snake_case
  }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite database connected successfully');
    
    // 禁用外键约束
    await sequelize.query('PRAGMA foreign_keys = OFF;');
    console.log('Foreign key constraints disabled');
    
    // 同步数据库模型（开发环境下）
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ force: false });
      console.log('Database models synchronized');
    }
    
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

// 优雅退出
process.on('SIGINT', async () => {
  await sequelize.close();
  console.log('Database connection closed.');
  process.exit(0);
});

module.exports = { sequelize, connectDB }; 