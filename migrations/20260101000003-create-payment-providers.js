'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payment_providers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false,
      },
      association_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'associations', key: 'id' },
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('stripe', 'paypal', 'sumup', 'other'),
        allowNull: false,
      },
      config: {
        type: Sequelize.JSONB,
        comment: 'Clés API et paramètres — à chiffrer au niveau applicatif',
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
    await queryInterface.dropTable('payment_providers');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_payment_providers_type";');
  },
};
