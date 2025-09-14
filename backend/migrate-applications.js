require('dotenv').config();
const { sequelize } = require('./src/config/database');

async function migrateApplications() {
  try {
    console.log('开始迁移Application表...');
    
    // 连接数据库
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 添加新字段
    const newColumns = [
      'ALTER TABLE applications ADD COLUMN medicalCheckDate DATETIME DEFAULT NULL',
      'ALTER TABLE applications ADD COLUMN medicalCheckStatus VARCHAR(255) DEFAULT NULL CHECK (medicalCheckStatus IN ("pending", "scheduled", "completed", "failed"))',
      'ALTER TABLE applications ADD COLUMN medicalCheckNotes TEXT DEFAULT NULL',
      'ALTER TABLE applications ADD COLUMN enrollmentDate DATETIME DEFAULT NULL',
      'ALTER TABLE applications ADD COLUMN enrollmentStatus VARCHAR(255) DEFAULT NULL CHECK (enrollmentStatus IN ("pending", "enrolled", "failed"))',
      'ALTER TABLE applications ADD COLUMN referralFeePaidAt DATETIME DEFAULT NULL',
      'ALTER TABLE applications ADD COLUMN pointsAwarded INTEGER DEFAULT 0',
      'ALTER TABLE applications ADD COLUMN pointsAwardedAt DATETIME DEFAULT NULL',
      'ALTER TABLE applications ADD COLUMN emergencyContact VARCHAR(255) DEFAULT NULL',
      'ALTER TABLE applications ADD COLUMN emergencyPhone VARCHAR(255) DEFAULT NULL'
    ];

    for (const sql of newColumns) {
      try {
        await sequelize.query(sql);
        console.log('✅ 成功执行:', sql.split(' ').slice(0, 6).join(' ') + '...');
      } catch (error) {
        if (error.message.includes('duplicate column name')) {
          console.log('⚠️  字段已存在:', sql.split(' ').slice(0, 6).join(' ') + '...');
        } else {
          console.error('❌ 执行失败:', sql);
          console.error('错误:', error.message);
        }
      }
    }

    // 更新status字段的约束
    try {
      await sequelize.query(`
        UPDATE applications 
        SET status = 'pending' 
        WHERE status NOT IN ('pending', 'reviewing', 'approved', 'rejected', 'medical_check', 'enrolled', 'completed', 'withdrawn', 'failed')
      `);
      console.log('✅ 更新了无效状态的记录');
    } catch (error) {
      console.error('❌ 更新状态失败:', error.message);
    }

    // 添加索引
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_applications_medical_check_status ON applications(medicalCheckStatus)',
      'CREATE INDEX IF NOT EXISTS idx_applications_enrollment_status ON applications(enrollmentStatus)',
      'CREATE INDEX IF NOT EXISTS idx_applications_referral_fee_paid ON applications(referralFeePaid)'
    ];

    for (const sql of indexes) {
      try {
        await sequelize.query(sql);
        console.log('✅ 成功创建索引');
      } catch (error) {
        console.error('❌ 创建索引失败:', error.message);
      }
    }

    console.log('\n✅ Application表迁移完成！');
    
  } catch (error) {
    console.error('❌ 迁移失败:', error);
  } finally {
    await sequelize.close();
    console.log('数据库连接已关闭');
  }
}

migrateApplications(); 