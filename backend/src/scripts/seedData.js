require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');
const { User, Trial, Application, Banner, Article } = require('../models');

const seedData = async () => {
  try {
    console.log('开始初始化数据库...');

    // 同步数据库
    await sequelize.sync({ force: true });
    console.log('数据库表已创建');

    // 创建管理员用户
    const adminPassword = await bcrypt.hash('123456', 12);
    const admin = await User.create({
      name: '系统管理员',
      phone: '13800000000',
      password: adminPassword,
      role: 'admin',
      isAgent: false,
      isActive: true
    });
    console.log('管理员用户已创建');

    // 创建代理用户
    const agentPassword = await bcrypt.hash('123456', 12);
    const agent = await User.create({
      name: '推荐代理',
      phone: '13800000001',
      password: agentPassword,
      role: 'agent',
      isAgent: true,
      channelId: '10001',
      isActive: true
    });
    console.log('代理用户已创建');

    // 创建普通用户和志愿者
    const userPassword = await bcrypt.hash('123456', 12);
    const users = [];
    
    // 创建测试用户
    for (let i = 2; i <= 4; i++) {
      const userData = {
        name: `测试用户${i-1}`,
        phone: `1380000000${i}`,
        password: userPassword,
        role: 'user',
        isAgent: false,
        isActive: true
      };
      
      // 第一个用户设为被推荐用户
      if (i === 2) {
        userData.referredBy = agent.id;
      }
      
      const user = await User.create(userData);
      users.push(user);
    }

    // 创建志愿者用户（适合株洲试验的）
    const volunteers = [
      { name: '张小明', phone: '13812345678', age: 25, gender: '男', height: 175, weight: 70 },
      { name: '李小红', phone: '13823456789', age: 28, gender: '女', height: 165, weight: 55 },
      { name: '王小强', phone: '13834567890', age: 32, gender: '男', height: 180, weight: 75 },
      { name: '陈小美', phone: '13845678901', age: 24, gender: '女', height: 160, weight: 50 },
      { name: '赵小军', phone: '13856789012', age: 35, gender: '男', height: 172, weight: 68 },
      { name: '孙小丽', phone: '13867890123', age: 29, gender: '女', height: 168, weight: 58 },
      { name: '周小华', phone: '13878901234', age: 26, gender: '男', height: 178, weight: 72 },
      { name: '吴小芳', phone: '13889012345', age: 31, gender: '女', height: 162, weight: 52 }
    ];

    for (const volunteerData of volunteers) {
      const userData = {
        name: volunteerData.name,
        phone: volunteerData.phone,
        password: userPassword,
        role: 'user',
        isAgent: false,
        isActive: true
      };
      
      const user = await User.create(userData);
      users.push(user);
    }
    console.log('普通用户和志愿者已创建');

    // 创建试验项目
    const trials = [
      {
        title: '丙酸氟替卡松皮肤涂抹试验（株洲）',
        company: '太美医疗科技',
        description: '丙酸氟替卡松（第三批）下手臂内侧涂抹试验，评估局部皮肤耐受性和安全性。入组后不采血不吃药不打针，仅手臂涂抹，无创体检。',
        requirements: '年龄18-55岁，男女不限；BMI：19-28之间，男生体重≥50kg，女生体重≥45kg；无任何食物、药物过敏史；最近14天没有服用过任何药物保健品',
        exclusionCriteria: '手臂有纹身、湿疹、皮疹、接触性皮炎、干癣、脂溢症、异形痣、疤痕、色素异常、包疖、外伤、皮肤感染、皮肤过于干燥起皮等皮肤症状或过度日晒或皮肤划痕阳性或毛发旺盛；7月份后参加过丙酸试验；妊娠期妇女',
        procedures: '9月12号常规体检+皮肤应答；9月14日入住-9月17日出组；连续住院3天，手臂涂抹药物；体检前一晚安排住宿',
        duration: '1个月（住院3天）',
        compensation: 2700,
        disease: '皮肤科',
        participantType: '健康者',
        location: '湖南省株洲市天元区株洲大道18号湖南省直中医医院',
        city: '株洲',
        hospital: '湖南省直中医医院',
        minAge: 18,
        maxAge: 55,
        genderRequirement: '不限',
        minBmi: 19,
        maxBmi: 28,
        totalSubjects: 30,
        currentSubjects: 0,
        referralFee: 50,
        contactName: '王医生',
        contactPhone: '0731-28290888',
        contactEmail: 'wang.doctor@hunan.com',
        status: 'recruiting',
        featured: true,
        isActive: true
      },
      {
        title: '糖尿病新药安全性评估',
        company: '康美制药',
        description: '针对2型糖尿病患者的新型口服降糖药物临床试验。',
        requirements: '年龄25-70岁，2型糖尿病，HbA1c 7-10%',
        exclusionCriteria: '1型糖尿病，严重糖尿病并发症，近期心脑血管事件',
        procedures: '筛选期4周，治疗期24周，随访期12周',
        duration: '40周',
        compensation: 5000,
        disease: '糖尿病',
        participantType: '患者',
        location: '上海市徐汇区枫林路180号复旦大学附属中山医院',
        city: '上海',
        hospital: '复旦大学附属中山医院',
        minAge: 25,
        maxAge: 70,
        genderRequirement: '不限',
        minBmi: 20,
        maxBmi: 35,
        totalSubjects: 150,
        currentSubjects: 0,
        referralFee: 800,
        contactName: '王医生',
        contactPhone: '021-64041990',
        contactEmail: 'wang.doctor@example.com',
        status: 'recruiting',
        featured: true,
        isActive: true
      },
      {
        title: '抗抑郁药物疗效研究',
        company: '精神健康研究所',
        description: '评估新型抗抑郁药物对中重度抑郁症患者的治疗效果。',
        requirements: '年龄18-60岁，诊断中重度抑郁症，HAMD评分≥20分',
        exclusionCriteria: '双相情感障碍，精神分裂症，有自杀倾向',
        procedures: '筛选期1周，治疗期8周，随访期4周',
        duration: '13周',
        compensation: 2500,
        disease: '抑郁症',
        participantType: '患者',
        location: '广州市天河区天河路600号中山大学附属第三医院',
        city: '广州',
        hospital: '中山大学附属第三医院',
        minAge: 18,
        maxAge: 60,
        genderRequirement: '不限',
        minBmi: 16,
        maxBmi: 35,
        totalSubjects: 80,
        currentSubjects: 0,
        referralFee: 400,
        contactName: '张医生',
        contactPhone: '020-85253333',
        contactEmail: 'zhang.doctor@example.com',
        status: 'recruiting',
        featured: false,
        isActive: true
      },
      {
        title: '骨质疏松治疗药物研究',
        company: '骨科医学中心',
        description: '针对绝经后骨质疏松症的新型治疗药物临床试验。',
        requirements: '绝经后女性，年龄50-75岁，确诊骨质疏松症',
        exclusionCriteria: '恶性肿瘤病史，严重肝肾功能不全，近期骨折',
        procedures: '筛选期2周，治疗期52周，随访期12周',
        duration: '66周',
        compensation: 8000,
        disease: '骨质疏松',
        participantType: '患者',
        location: '深圳市福田区东门北路1017号深圳市人民医院',
        city: '深圳',
        hospital: '深圳市人民医院',
        minAge: 50,
        maxAge: 75,
        genderRequirement: '女',
        minBmi: 18,
        maxBmi: 32,
        totalSubjects: 60,
        currentSubjects: 0,
        referralFee: 1200,
        contactName: '陈医生',
        contactPhone: '0755-25533018',
        contactEmail: 'chen.doctor@example.com',
        status: 'recruiting',
        featured: true,
        isActive: true
      },
      {
        title: '慢性肾病新疗法试验',
        company: '肾脏病研究中心',
        description: '慢性肾脏病3-4期患者的创新治疗方案评估。',
        requirements: '年龄18-70岁，慢性肾脏病3-4期，eGFR 15-59',
        exclusionCriteria: '需要透析治疗，急性肾损伤，肾移植史',
        procedures: '筛选期4周，治疗期36周，随访期12周',
        duration: '52周',
        compensation: 6000,
        disease: '慢性肾病',
        participantType: '患者',
        location: '杭州市西湖区庆春路79号浙江大学医学院附属第一医院',
        city: '杭州',
        hospital: '浙江大学医学院附属第一医院',
        minAge: 18,
        maxAge: 70,
        genderRequirement: '不限',
        minBmi: 18,
        maxBmi: 30,
        totalSubjects: 120,
        currentSubjects: 0,
        referralFee: 600,
        contactName: '刘医生',
        contactPhone: '0571-87236114',
        contactEmail: 'liu.doctor@example.com',
        status: 'recruiting',
        featured: false,
        isActive: true
      }
    ];

    const createdTrials = [];
    for (const trialData of trials) {
      const trial = await Trial.create(trialData);
      createdTrials.push(trial);
    }
    console.log('试验项目已创建');

    // 创建一些申请数据（针对株洲试验）
    const zhuZhouTrial = createdTrials[0]; // 株洲丙酸氟替卡松试验

    const applicationData = [
      {
        userId: users[3].id, // 张小明
        trialId: zhuZhouTrial.id,
        name: '张小明',
        phone: '13812345678',
        idCard: '430102199901018888',
        gender: '男',
        birthday: '1999-01-01',
        age: 25,
        height: 175,
        weight: 70,
        bmi: 22.86,
        medicalHistory: '无',
        currentMedications: '无',
        allergies: '无',
        referrerId: agent.id,
        referralFeeAmount: 50,
        status: 'pending'
      },
      {
        userId: users[4].id, // 李小红
        trialId: zhuZhouTrial.id,
        name: '李小红',
        phone: '13700000002',
        idCard: '430102199902028888',
        gender: '女',
        birthday: '1999-02-02',
        age: 25,
        height: 160,
        weight: 55,
        bmi: 20.20,
        medicalHistory: '无',
        currentMedications: '无',
        allergies: '无',
        referralFeeAmount: 50,
        status: 'approved'
      },
      {
        userId: users[5].id, // 王大明
        trialId: createdTrials[1].id, // 糖尿病新药安全性评估
        name: '王大明',
        phone: '13700000003',
        idCard: '430102199903038888',
        gender: '男',
        birthday: '1999-03-03',
        age: 25,
        height: 180,
        weight: 75,
        bmi: 23.15,
        medicalHistory: '无',
        currentMedications: '无',
        allergies: '无',
        status: 'pending'
      }
    ];

    for (const appData of applicationData) {
      await Application.create(appData);
    }

    // 更新试验的申请人数
    await Trial.update(
      { currentSubjects: 3 },
      { where: { id: zhuZhouTrial.id } }
    );

    console.log('申请数据已创建');

    console.log('\n=== 数据初始化完成 ===');
    console.log('测试账户信息：');
    console.log('管理员: 13800000000 / 123456');
    console.log('代理: 13800000001 / 123456 (推荐码: 10001)');
    console.log('用户1: 13800000002 / 123456 (已被推荐)');
    console.log('用户2: 13800000003 / 123456');
    console.log('用户3: 13800000004 / 123456');
    console.log('\n志愿者账户：');
    console.log('张小明: 13812345678 / 123456 (已申请株洲试验-待审核)');
    console.log('李小红: 13823456789 / 123456 (已申请株洲试验-已通过)');
    console.log('王小强: 13834567890 / 123456 (已申请株洲试验-已拒绝)');
    console.log('陈小美: 13845678901 / 123456');
    console.log('赵小军: 13856789012 / 123456');
    console.log('孙小丽: 13867890123 / 123456');
    console.log('周小华: 13878901234 / 123456');
    console.log('吴小芳: 13889012345 / 123456');
    console.log('\n株洲丙酸氟替卡松试验信息：');
    console.log('- 补贴：2700元 + 700元依从性奖励');
    console.log('- 报销路费：最高50元');
    console.log('- 体检时间：9月12号');
    console.log('- 入住时间：9月14-17日');
    console.log('- 当前申请人数：3人');

    // 创建示例横幅
    const banners = [
      {
        title: '安全参与临床试验',
        subtitle: '专业医疗团队全程保障',
        imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        linkUrl: '/blog',
        linkText: '了解更多',
        order: 1,
        isActive: true,
        backgroundColor: '#3b82f6',
        textColor: '#ffffff'
      },
      {
        title: '高额补偿 安全保障',
        subtitle: '参与试验获得丰厚补贴',
        imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        linkUrl: '/',
        linkText: '立即报名',
        order: 2,
        isActive: true,
        backgroundColor: '#10b981',
        textColor: '#ffffff'
      }
    ];

    for (const bannerData of banners) {
      await Banner.create(bannerData);
    }
    console.log('示例横幅已创建');

    console.log('数据初始化完成');

  } catch (error) {
    console.error('数据初始化失败:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

// 运行初始化
seedData(); 