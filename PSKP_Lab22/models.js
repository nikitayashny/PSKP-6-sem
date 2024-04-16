const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
    'pskp_lab22',
    'postgres',
    '3115',
    {
         dialect: 'postgres',
         host: 'localhost',
         port: '5432'
    } 
);

const Subscriber = sequelize.define('Subscriber', {
  chatId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
});

module.exports = { sequelize, Subscriber };