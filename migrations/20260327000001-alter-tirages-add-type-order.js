'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Type de tirage
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE "enum_tirages_type" AS ENUM ('quine', 'double_quine', 'carton_plein', 'pause');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `)

    await queryInterface.addColumn('tirages', 'type', {
      type:         Sequelize.ENUM('quine', 'double_quine', 'carton_plein', 'pause'),
      allowNull:    false,
      defaultValue: 'quine',
    })

    // 2. Ordre dans la session
    await queryInterface.addColumn('tirages', 'order', {
      type:         Sequelize.INTEGER,
      allowNull:    false,
      defaultValue: 0,
    })

    // 3. Étendre le status avec les valeurs de planification
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        ALTER TYPE "enum_tirages_status" ADD VALUE IF NOT EXISTS 'draft';
        ALTER TYPE "enum_tirages_status" ADD VALUE IF NOT EXISTS 'ready';
      END $$;
    `)

    // 4. Rendre lot_id nullable (pauses et tirage_lots)
    await queryInterface.sequelize.query(`
      ALTER TABLE tirages ALTER COLUMN lot_id DROP NOT NULL;
    `)
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('tirages', 'type')
    await queryInterface.removeColumn('tirages', 'order')
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_tirages_type";')
  },
}
