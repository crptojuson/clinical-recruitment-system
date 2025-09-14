const { Sequelize } = require('sequelize');
const path = require('path');

// 创建数据库连接
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: console.log
});

async function updateTrialStatus() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 更新状态值映射
    const statusMapping = {
      'recruiting': 'active',
      'ongoing': 'active', 
      'suspended': 'inactive',
      'completed': 'completed'
    };

    for (const [oldStatus, newStatus] of Object.entries(statusMapping)) {
      const [results] = await sequelize.query(
        'UPDATE trials SET status = ? WHERE status = ?',
        {
          replacements: [newStatus, oldStatus]
        }
      );
      
      if (results > 0) {
        console.log(`更新了 ${results} 条记录: ${oldStatus} -> ${newStatus}`);
      }
    }

    console.log('状态更新完成');
    
  } catch (error) {
    console.error('更新失败:', error);
  } finally {
    await sequelize.close();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  updateTrialStatus();
}

module.exports = updateTrialStatus; 