'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('multi_winner_rules', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false,
      },
      session_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'sessions', key: 'id' },
        onDelete: 'CASCADE',
      },
      lot_id: {
        type: Sequelize.UUID,
        references: { model: 'lots', key: 'id' },
        onDelete: 'SET NULL',
        comment: 'NULL = règle globale applicable à toute la session',
      },
      rule_type: {
        type: Sequelize.ENUM('split', 'redraw', 'first_complete'),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('multi_winner_rules');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_multi_winner_rules_rule_type";');
  },
};
