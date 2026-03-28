'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('sessions', 'display_code', {
      type:      Sequelize.STRING(4),
      allowNull: true,
    });

    // Index unique (PostgreSQL autorise plusieurs NULL dans un index unique)
    await queryInterface.addIndex('sessions', ['display_code'], {
      name:   'sessions_display_code_unique',
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('sessions', 'sessions_display_code_unique');
    await queryInterface.removeColumn('sessions', 'display_code');
  },
};
