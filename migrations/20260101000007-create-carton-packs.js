'use strict';

// Utilise du SQL brut pour supporter la colonne GENERATED ALWAYS AS STORED
// et les contraintes CHECK natives PostgreSQL.
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE TABLE carton_packs (
        id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
        session_id      UUID          NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
        label           VARCHAR(80)   NOT NULL,
        quantity        SMALLINT      NOT NULL,
        price           DECIMAL(6,2)  NOT NULL,
        price_unit      DECIMAL(6,2)  GENERATED ALWAYS AS (price / quantity) STORED,
        is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
        display_order   SMALLINT      NOT NULL DEFAULT 0,
        max_per_person  SMALLINT,
        created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

        CONSTRAINT chk_carton_packs_quantity_positive CHECK (quantity > 0),
        CONSTRAINT chk_carton_packs_price_positive    CHECK (price >= 0)
      );
    `);

    await queryInterface.sequelize.query(
      `CREATE INDEX idx_carton_packs_session_id ON carton_packs(session_id);`
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('carton_packs');
  },
};
