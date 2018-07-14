var myDatabase = require('../controllers/database');
var sequelize = myDatabase.sequelize;
var Sequelize = myDatabase.Sequelize;

const ListingModel = sequelize.define('Listings', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        trim: true
    },
    group: {
        type: Sequelize.INTEGER
    },
    hobby: {
        type: Sequelize.STRING,
        trim: true
    }
});

ListingModel.sync({ force: false, logging: console.log }).then(() => {
    //table created
    console.log("listings table synced");
    ListingModel.upsert({
        id:1,
        name: "Nike Flyknit Racer",
        group: 100,
        hobby: "Used"
    });
    ListingModel.upsert({
        id:2,
        name: "Red Velvet Cookie Jar Mini Album",
        group: 32,
        hobby: "New"
    });
    ListingModel.upsert({
        id:3,
        name: "Red Velvet Ernest Photocard",
        group: 12,
        hobby: "New"
    });
})

module.exports = sequelize.model('Listings', ListingModel);