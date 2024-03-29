var Sequelize = require('sequelize');
var sequelizeTransforms = require('sequelize-transforms');

const sequelize = new Sequelize('itp211db','root','mysql', {
// const sequelize = new Sequelize('itp211db','root','Shizamed1', {
    host: 'localhost',
    port: '3306',
    dialect: 'mysql',
    pool: {
        max:5,
        min:0,
        acquire:30000,
        idle:10000
    },
    operatorsAliases: false
});

sequelize.authenticate().then(() => {
    console.log('========================================================')
    console.log('From: server/controllers/database.js')
    console.log('Database connection has been established successfully.');
    console.log('========================================================')
}).catch(err => {
    console.log('From: server/controllers/database.js')
    console.error('Unable to connect to the database:', err);
});

sequelizeTransforms(sequelize);

module.exports.sequelize = sequelize;
module.exports.sequelizeInstance = sequelize;
module.exports.Sequelize = Sequelize;
