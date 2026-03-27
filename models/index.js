'use strict';

const Sequelize = require('sequelize');
const process   = require('process');
const env       = process.env.NODE_ENV || 'development';
const config    = require('../config/config')[env];
const db        = {};

const sequelize = new Sequelize(config.url, {
  dialect:        config.dialect,
  dialectOptions: config.dialectOptions,
  logging:        env === 'development' ? console.log : false,
});

// Chargement explicite des modèles (compatible Turbopack / bundlers statiques)
const modelFactories = [
  require('./association'),
  require('./user'),
  require('./session'),
  require('./lot'),
  require('./cartonPack'),
  require('./carton'),
  require('./participant'),
  require('./paiement'),
  require('./paiementCarton'),
  require('./tirage'),
  require('./tirageLot'),
  require('./drawEvent'),
  require('./partner'),
  require('./paymentProvider'),
  require('./userSession'),
  require('./multiWinnerRule'),
  require('./auditLog'),
];

modelFactories.forEach(factory => {
  const model = factory(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
});

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
