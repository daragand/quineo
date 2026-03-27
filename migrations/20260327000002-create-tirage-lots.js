'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tirage_lots', {
      tirage_id: {
        type:       Sequelize.UUID,
        allowNull:  false,
        references: { model: 'tirages', key: 'id' },
        onDelete:   'CASCADE',
        primaryKey: true,
      },
      lot_id: {
        type:       Sequelize.UUID,
        allowNull:  false,
        references: { model: 'lots', key: 'id' },
        onDelete:   'CASCADE',
        primaryKey: true,
      },
      order: {
        type:         Sequelize.INTEGER,
        allowNull:    false,
        defaultValue: 0,
      },
    })

    await queryInterface.addIndex('tirage_lots', ['tirage_id'], { name: 'tirage_lots_tirage_id_idx' })
    await queryInterface.addIndex('tirage_lots', ['lot_id'],    { name: 'tirage_lots_lot_id_unique', unique: true })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tirage_lots')
  },
}
