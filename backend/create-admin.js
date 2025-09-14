require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('./src/config/database');
const { User } = require('./src/models');

async function createOrUpdateAdmin() {
  try {
    console.log('开始设置管理员账号...');
    
    // 连接数据库
    await sequelize.authenticate();
    console.log('数据库连接成功');

    const adminPhone = '13409881403';
    const adminPassword = 'zs184542348';
    const adminName = '管理员';

    // 检查用户是否已存在
    let user = await User.findOne({ where: { phone: adminPhone } });
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    if (user) {
      // 用户存在，更新为管理员
      await user.update({
        password: hashedPassword,
        role: 'admin',
        isAgent: false,
        isActive: true,
        name: adminName
      });
      console.log(`✅ 用户 ${adminPhone} 已更新为管理员账号`);
      console.log(`用户信息: 姓名=${user.name}, 角色=${user.role}, 状态=${user.isActive ? '激活' : '未激活'}`);
    } else {
      // 用户不存在，创建新的管理员账号
      user = await User.create({
        name: adminName,
        phone: adminPhone,
        password: hashedPassword,
        role: 'admin',
        isAgent: false,
        isActive: true
      });
      console.log(`✅ 管理员账号 ${adminPhone} 创建成功`);
      console.log(`用户信息: ID=${user.id}, 姓名=${user.name}, 角色=${user.role}`);
    }

    console.log('\n管理员账号设置完成！');
    console.log(`手机号: ${adminPhone}`);
    console.log(`密码: ${adminPassword}`);
    console.log(`角色: admin`);
    
  } catch (error) {
    console.error('设置管理员账号失败:', error);
  } finally {
    await sequelize.close();
    console.log('数据库连接已关闭');
  }
}

createOrUpdateAdmin(); 