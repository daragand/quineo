'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_cartons_status" ADD VALUE IF NOT EXISTS 'reserved';`
    );
  },
  async down() {
    // PostgreSQL ne permet pas de supprimer une valeur d'un ENUM sans recréer le type.
  },
};
