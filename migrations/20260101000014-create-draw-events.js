'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('draw_events', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false,
      },
      tirage_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'tirages', key: 'id' },
        onDelete: 'CASCADE',
      },
      number: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Numéro tiré (1-90)',
      },
      sequence: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Ordre du numéro dans le tirage',
      },
      drawn_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('draw_events', ['tirage_id', 'number'], {
      unique: true,
      name: 'draw_events_tirage_id_number_unique',
    });
    await queryInterface.addIndex('draw_events', ['tirage_id', 'sequence'], {
      unique: true,
      name: 'draw_events_tirage_id_sequence_unique',
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE draw_events
        ADD CONSTRAINT chk_draw_events_number_range CHECK (number BETWEEN 1 AND 90);
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('draw_events');
  },
};
