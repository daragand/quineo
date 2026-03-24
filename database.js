const { Sequelize } = require('sequelize');
const process = require('process');

const env = process.env.NODE_ENV || 'development';
const config = require('./config/config')[env];

const sequelize = new Sequelize(config.url, {
  dialect: config.dialect,
  dialectOptions: config.dialectOptions,
  logging: env === 'development' ? console.log : false,
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données établie avec succès.');
  } catch (error) {
    console.error('Impossible de se connecter à la base de données :', error);
    throw error;
  }
}

module.exports = { sequelize, testConnection };
