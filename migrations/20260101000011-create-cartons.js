'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('cartons', {
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
      participant_id: {
        type: Sequelize.UUID,
        references: { model: 'participants', key: 'id' },
        onDelete: 'SET NULL',
      },
      serial_number: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      grid: {
        type: Sequelize.JSONB,
        allowNull: false,
        comment: 'Grille 3x9 — tableau 2D de nombres (0 = case vide)',
      },
      status: {
        type: Sequelize.ENUM('available', 'sold', 'cancelled'),
        allowNull: false,
        defaultValue: 'available',
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

    await queryInterface.addIndex('cartons', ['session_id', 'serial_number'], {
      unique: true,
      name: 'cartons_session_id_serial_number_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('cartons');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_cartons_status";');
  },
};
