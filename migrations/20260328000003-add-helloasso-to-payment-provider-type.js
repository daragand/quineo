'use strict';

module.exports = {
  async up(queryInterface) {
    // PostgreSQL : ajoute la valeur si elle n'existe pas déjà
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_payment_providers_type" ADD VALUE IF NOT EXISTS 'helloasso';
    `);
  },

  // Impossible de retirer une valeur d'un ENUM PostgreSQL sans recréer le type —
  // le down est intentionnellement vide
  async down() {},
};
