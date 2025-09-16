require('dotenv').config();
const { sequelize } = require('./src/config/database');

async function updateScreeningSystem() {
  try {
    console.log('开始更新筛选系统字段...');
    
    // 连接数据库
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 检查screeningSystem字段是否存在
    try {
      const [results] = await sequelize.query(`
        PRAGMA table_info(trials);
      `);
      
      const hasScreeningSystem = results.some(column => column.name === 'screeningSystem');
      
      if (!hasScreeningSystem) {
        // 添加screeningSystem字段
        await sequelize.query(`
          ALTER TABLE trials 
          ADD COLUMN screeningSystem VARCHAR(255) DEFAULT '不联网项目'
        `);
        console.log('✅ 成功添加screeningSystem字段');
        
        // 添加索引
        await sequelize.query(`
          CREATE INDEX IF NOT EXISTS trials_screening_system_idx ON trials(screeningSystem)
        `);
        console.log('✅ 成功添加索引');
      } else {
        console.log('⚠️  screeningSystem字段已存在');
      }
      
      // 检查并更新现有数据，确保所有值都是有效的
      const validValues = ['太美', '中兴联网', '全国联网', '不联网项目'];
      
      // 查询当前所有的screeningSystem值
      const [currentValues] = await sequelize.query(`
        SELECT DISTINCT screeningSystem FROM trials WHERE screeningSystem IS NOT NULL
      `);
      
      console.log('当前数据库中的筛选系统值:', currentValues.map(row => row.screeningSystem));
      
      // 更新无效值为默认值
      await sequelize.query(`
        UPDATE trials 
        SET screeningSystem = '不联网项目' 
        WHERE screeningSystem IS NULL 
           OR screeningSystem NOT IN ('太美', '中兴联网', '全国联网', '不联网项目')
      `);
      
      console.log('✅ 已更新无效的筛选系统值为默认值');
      
      // 验证更新结果
      const [finalValues] = await sequelize.query(`
        SELECT DISTINCT screeningSystem FROM trials
      `);
      
      console.log('更新后的筛选系统值:', finalValues.map(row => row.screeningSystem));
      
    } catch (error) {
      console.error('❌ 更新筛选系统字段失败:', error.message);
    }

    console.log('\n✅ 筛选系统字段更新完成！');
    
  } catch (error) {
    console.error('❌ 更新失败:', error);
  } finally {
    await sequelize.close();
    console.log('数据库连接已关闭');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  updateScreeningSystem();
}

module.exports = updateScreeningSystem; 