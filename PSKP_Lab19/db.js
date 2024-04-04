const { Sequelize } = require('sequelize');

module.exports = new Sequelize('PSKP_Lab19', 'sa', '1234', {
    dialect: 'mssql',
    port: 1433,
    define: {
        timestamps: false,
    },
    pool: {
        max: 5,
        min: 0,
        idle: 10000,
    },
});
