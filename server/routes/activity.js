var express = require("express");
var activityRouter = express.Router();

// Import reviews controller
var reviewsController = require('../controllers/reviewsController');

// Setup routes for activity(reviews)
// activityRouter.get('/activity', reviewsController.hasAuthorization, reviewsController.show);
activityRouter.get("/review/:id", reviewsController.hasAuthorization, reviewsController.show); 
activityRouter.post('/newReview', reviewsController.hasAuthorization, reviewsController.create);

module.exports = activityRouter;