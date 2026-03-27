'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'super_admin';
    `)
  },

  async down() {
    // PostgreSQL ne supporte pas la suppression de valeurs d'un ENUM
    // Pour revenir en arrière, recréer le type manuellement
  },
}
