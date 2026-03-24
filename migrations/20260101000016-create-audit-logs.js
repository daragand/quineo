'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('audit_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
        comment: 'NULL si action système',
      },
      session_id: {
        type: Sequelize.UUID,
        references: { model: 'sessions', key: 'id' },
        onDelete: 'SET NULL',
      },
      action: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Ex : SESSION_STARTED, TIRAGE_COMPLETED, CARTON_SOLD…',
      },
      entity_type: {
        type: Sequelize.STRING,
        comment: 'Nom de la table concernée',
      },
      entity_id: {
        type: Sequelize.STRING,
        comment: 'UUID de l\'entité concernée',
      },
      details: {
        type: Sequelize.JSONB,
      },
      ip_address: {
        type: Sequelize.STRING(45),
        comment: 'IPv4 ou IPv6',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('audit_logs', ['user_id'], { name: 'audit_logs_user_id_idx' });
    await queryInterface.addIndex('audit_logs', ['session_id'], { name: 'audit_logs_session_id_idx' });
    await queryInterface.addIndex('audit_logs', ['action'], { name: 'audit_logs_action_idx' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('audit_logs');
  },
};
