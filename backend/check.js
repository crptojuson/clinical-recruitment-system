const { Trial } = require('./src/models');

async function check() {
  try {
    const count = await Trial.count();
    console.log('总试验数:', count);
    
    const active = await Trial.count({
      where: { 
        status: 'recruiting', 
        isActive: true 
      }
    });
    console.log('活跃试验数:', active);
    
    const all = await Trial.findAll({
      attributes: ['id', 'title', 'status', 'isActive'],
      limit: 5
    });
    
    console.log('前5个试验:');
    all.forEach(t => {
      console.log(`- ${t.id}: ${t.title} (状态:${t.status}, 活跃:${t.isActive})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('错误:', error);
    process.exit(1);
  }
}

check(); 