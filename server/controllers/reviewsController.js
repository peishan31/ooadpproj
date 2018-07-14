// get Profile model
var Profile = require('../models/profileModel');
var Reviews = require('../models/reviewsModel');
var UsersModel = require('../models/users');

var myDatabase = require('./database');

// List reviews & details from reviews
exports.show = function(req, res) {
	// Render home screen
	res.render('activity', {
        title: 'Adamire - Activity',
        webTitle: 'Activity:'
	});
};

// Create Reviews
exports.create = function (req, res) {
    Profile.findAll(
        {where:{targetUsername: req.body.username}
    }).then(function(profile){
        var jsonString = JSON.stringify(profile);
        console.log(jsonString);
        var obj = JSON.parse(jsonString);
        totalRatings = 0; // set global
        numOfRatings = 0; // set global

        for (item in obj) {
            totalRatings += obj[item].rating;
            numOfRatings += 1;
            console.log("*********obj[item].rating: ",obj[item].rating);
            console.log("******item:",item);
        }
        console.log("total = "+totalRatings);
        ave = (totalRatings/numOfRatings);
        console.log("ave = "+ave);
        totalRatings= totalRatings + parseInt(req.body.rating);
        console.log("total(include req.body.rating) = "+totalRatings);
        numOfRatings = numOfRatings + 1;
        console.log("numOfRatings(include req.body.rating) = "+numOfRatings);
        ave = totalRatings/numOfRatings;
        console.log("ave(include req.body.rating) = "+ave);
        
    }).then(function (profile){
        console.log("!!!!!!!!ave:",ave);
        console.log("!!!!!!!!numOfRatings:",numOfRatings);
        console.log("!!!!!!!!req.body.username:",req.body.username);
        var ratingsData = {
            username: req.body.username,
            averageRating: ave,
            reviewCount: numOfRatings
        };
        var reviewData = {
            buyerOrSeller: req.body.buyerOrSeller,
            title: req.body.title,
            content: req.body.content,
            rating: req.body.rating,
            by: req.user.username,
            targetUsername: req.body.username,
            user_id: req.user.id,
        };
        Profile.create(reviewData).then((newReview, created) => {
            Reviews.update(ratingsData, { where: { username: req.body.username } }).then((newRatings) => {
                if (!newReview || !newRatings || newRatings == 0) {
                    return res.send(400, {
                        message: "error"
                    });
                }
                res.redirect('/profile/'+req.body.username);
            })
        })
    });
}


// Reviews authorization middleware
exports.hasAuthorization = function (req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
};