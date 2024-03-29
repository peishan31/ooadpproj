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
    itemImage: {
        type: Sequelize.STRING,
    },
    group: {
        type: Sequelize.INTEGER
    },
    hobby: {
        type: Sequelize.STRING,
        trim: true
    },
    category: {
        type: Sequelize.STRING,
    },
    by: { // sorry for hogging your page, but I rlly need to add this to display your listings for my profile page
        type: Sequelize.STRING
    }
});

ListingModel.sync({ force: false, logging: console.log }).then(() => {
    //table created
    console.log("listings table synced");
    ListingModel.upsert({
        id:1,
        name: "2017 N Level Math",
        // itemImage: "/uploads/itemImage/o level book.jpg",
        itemImage: "o level book.jpg",
        group: 100,
        hobby: "Used",
        category: "Art & Design",
        by: "benjaminloke",
        itemImage:"013440_131775336_thumbnail.jpg"
    });
    ListingModel.upsert({
        id:2,
        name: "Engineering Mathematics",
        // itemImage: "/uploads/itemImage/165811_55859657_thumbnail.jpg",
        itemImage: "165811_55859657_thumbnail.jpg",
        group: 32,
        hobby: "New",
        category: "Humanities",
        by: "benjaminloke",
        itemImage:"132433_152214455_thumbnail.jpg"
        
    });
    ListingModel.upsert({
        id:3,
        name: "2018 A Level Exercise Books",
        //itemImage: "/uploads/itemImage/secondary_1_topical_science_practice_book_1462534369_6010a887.jpg",
        itemImage: "secondary_1_topical_science_practice_book_1462534369_6010a887.jpg",
        group: 12,
        hobby: "New",
        category: "Mathematics",
        by: "benjaminloke",
        itemImage:"135020_148470207_thumbnail.jpg"
    });
    ListingModel.upsert({
        id:4,
        name: "Social Studies Textbook",
        itemImage: "secondary_1_topical_science_practice_book_1462534369_6010a887.jpg",
        group: 4,
        hobby: "New",
        by: "johannajimeno"
    });
    ListingModel.upsert({
        id:5,
        name: "Social Studies Textbook",
        itemImage: "secondary_1_topical_science_practice_book_1462534369_6010a887.jpg",
        group: 3,
        hobby: "New",
        by: "linpeishan"
    });
})

module.exports = sequelize.model('Listings', ListingModel);