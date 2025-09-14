const User = require('./User');
const Trial = require('./Trial');
const Application = require('./Application');
const Banner = require('./Banner');
const Article = require('./Article');

// 定义关联关系
User.hasMany(Application, { 
  foreignKey: 'userId',
  as: 'applications'
});

Application.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Trial.hasMany(Application, {
  foreignKey: 'trialId',
  as: 'applications'
});

Application.belongsTo(Trial, {
  foreignKey: 'trialId',
  as: 'trial'
});

// 推荐关系
User.hasMany(Application, {
  foreignKey: 'referrerId',
  as: 'referredApplications'
});

Application.belongsTo(User, {
  foreignKey: 'referrerId',
  as: 'referrer'
});

// 审核人关系
User.hasMany(Application, {
  foreignKey: 'reviewedBy',
  as: 'reviewedApplications'
});

Application.belongsTo(User, {
  foreignKey: 'reviewedBy',
  as: 'reviewer'
});

module.exports = {
  User,
  Trial,
  Application,
  Banner,
  Article
}; 