'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 移除applications表中的emergencyContact和emergencyPhone字段
    await queryInterface.removeColumn('applications', 'emergencyContact');
    await queryInterface.removeColumn('applications', 'emergencyPhone');
    
    // 移除users表中的emergencyContact和emergencyPhone字段
    await queryInterface.removeColumn('users', 'emergencyContact');
    await queryInterface.removeColumn('users', 'emergencyPhone');
  },

  async down(queryInterface, Sequelize) {
    // 回滚时重新添加字段
    await queryInterface.addColumn('applications', 'emergencyContact', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('applications', 'emergencyPhone', {
      type: Sequelize.STRING(11),
      allowNull: true
    });
    
    await queryInterface.addColumn('users', 'emergencyContact', {
      type: Sequelize.STRING(50),
      allowNull: true
    });
    await queryInterface.addColumn('users', 'emergencyPhone', {
      type: Sequelize.STRING(11),
      allowNull: true
    });
  }
}; 