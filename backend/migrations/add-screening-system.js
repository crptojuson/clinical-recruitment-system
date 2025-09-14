'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('trials', 'screeningSystem', {
      type: Sequelize.STRING,
      defaultValue: '不联网项目',
      allowNull: false,
      validate: {
        isIn: [['太美', '中兴联网', '全国联网', '不联网项目']]
      }
    });

    // 添加索引
    await queryInterface.addIndex('trials', ['screeningSystem'], {
      name: 'trials_screening_system_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('trials', 'trials_screening_system_idx');
    await queryInterface.removeColumn('trials', 'screeningSystem');
  }
}; 