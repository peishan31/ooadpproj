// Import basic modules
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var socket = require("socket.io");

// import multer
// var multer = require('multer');
// var upload = multer({ dest:'./public/uploads/', limits: {fileSize: 1500000, files:1} });

// Modules to store session
var myDatabase = require('./server/controllers/database');
var expressSession = require('express-session');
var SessionStore = require('express-session-sequelize')(expressSession.Store);
var sequelizeSessionStore = new SessionStore({
    db: myDatabase.sequelize,
});
// Import Passport and Warning flash modules
var passport = require('passport');
var flash = require('connect-flash');

var app = express();
var serverPort = 3000;
var httpServer = require('http').Server(app);


// view engine setup
app.set('views', path.join(__dirname, 'server/views/pages'));
app.set('view engine', 'ejs');

// Passport configuration
require('./server/config/passport')(passport);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('node-sass-middleware')({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true,
    sourceMap: true
}));

// Setup public directory
app.use(express.static(path.join(__dirname, 'public')));

// required for passport
// secret for session
app.use(expressSession({
    secret: 'sometextgohere',
    store: sequelizeSessionStore,
    resave: false,
    saveUninitialized: false,
}));

// Init passport authentication
app.use(passport.initialize());
// persistent login sessions
app.use(passport.session());
// flash messages
app.use(flash());

app.use(function(req,res,next){ res.locals.login = req.isAuthenticated(); res.locals.user = req.user; next(); });

//====================================================================================================================================
// Application Routes
// Index Route AKA Homepage
var indexRouter = require('./server/routes/index');
app.use('/',indexRouter);

// Authorization Route: Login/ Signup/ Logout
var authRouter = require('./server/routes/auth');
app.use('/',authRouter); 

// Admin Page
var adminRouter = require('./server/routes/admin');
app.use('/',adminRouter);

// Settings
var settingsRouter = require('./server/routes/settings');
app.use('/',settingsRouter);

// Profile
var profileRouter = require('./server/routes/profile');
app.use('/',profileRouter);

// Top Sellers
var topSellersRouter = require('./server/routes/topSellers');
app.use("/",topSellersRouter);

// Activity
var activityRouter = require('./server/routes/activity');
app.use('/',activityRouter);

// Ewallet
var ewalletRouter = require('./server/routes/ewallet');
app.use('/',ewalletRouter);

// Offers
var offersRouter = require('./server/routes/offers');
app.use('/',offersRouter);

// Notifications
var notificationsRouter = require('./server/routes/notifications');
app.use('/',notificationsRouter);

// Listings
var listingRouter = require('./server/routes/listing');
app.use('/',listingRouter);
// Setup chat
var io = require('socket.io')(httpServer);
var chatConnections = 0;
var ChatMsg = require('./server/models/chatMsg');
var makeOffer = require('./server/models/makeOffer');
var listings = require('./server/models/listingModel')

var myDatabase = require('./server/controllers/database');
var sequelize = myDatabase.sequelize;
const Op = sequelize.Op;

io.on('connection', function(socket) {
    chatConnections++;
    console.log("Num of chat users connected: "+chatConnections);

    socket.on('disconnect', function() {
        chatConnections--;
        console.log("Num of chat users connected: "+chatConnections);
    });

})
app.get('/messages/:id', function (req,res) {
    var record_num = req.params.id;
    listings.findById(record_num).then(function (listingRecord) {
        console.log("**************************************",listingRecord)
        makeOffer.findAll({
            attributes: ['id','name','offerprice']
        }).then((offers) => {
            ChatMsg.findAll({
                attributes: ['id','name','message','buyername','sellername'],
                where: {
                    [Op.or]: [{buyername: req.user.username}, {sellername: req.user.username}]
                }
            
            }).then((chatMessages) => {
                console.log("**************************req.body.sellername:",req.body.sellername)
                res.render('chatMsg', {
                    url: req.protocol + "://" + req.get("host") + req.url,
                    user:req.user.username,
                    data: chatMessages,
                    offers: offers,
                    listings: listingRecord
                });
            });
        })
    }).catch((err) => {
        return res.status(400).send({
            message: err
        });
    });
});
app.post('/messages/:id', function (req,res) {
    var record_num = req.params.id;
    listings.findById(record_num).then(function (listingRecord) {
        var lastUser = '';
        ChatMsg.findAll().then(function(chatdata){
            var jsonString = JSON.stringify(chatdata);
            var obj = JSON.parse(jsonString);
            for (item in obj) {
                lastUser = obj[item].buyername
                console.log("......",obj[item].buyername)
            }
        }).then(function(chatdata){
            console.log("******************lastUser",lastUser)
            console.log("******************listingRecord.by",listingRecord.by)
            if (req.user.username == listingRecord.by){
                var chatData = {
                    name: req.body.name,
                    message: req.body.message,
                    buyername: lastUser,
                    sellername: listingRecord.by 
                }
           } else{
               var chatData = {
                   name: req.body.name,
                   message: req.body.message,
                   buyername: req.user.username,
                   sellername:listingRecord.by,
               }
           }
           //Save into database
           ChatMsg.create(chatData).then((newMessage) => {
               if(!newMessage) {
                   sendStatus(500);
               }
               io.emit('message', req.body)
               res.sendStatus(200)
           })
        })
    }).catch((err) => {
        return res.status(400).send({
            message: err
        });
    });
});
//Post offer price into database
var OfferPrice = require('./server/models/makeOffer');
app.post('/makeOffer', function (req,res) {
    console.log('Making new offer');
    var makeOfferData = {
        name: req.user.username,
        offerprice: req.body.offerprice
    }
    //Save into database
    OfferPrice.create(makeOfferData).then((newOfferData) => {
        if(!newOfferData) {
            sendStatus(500);
        }
        io.emit('message', req.body)
    })
});
//Inbox
app.get('/inboxMessage', function(req, res) {
    res.render("inboxMessage", {
        title: "Inbox"
    })
}) 

//===========================================================================================================================================
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;

app.set('port', serverPort);

var server = httpServer.listen(app.get('port'), function () {
    console.log('========================================================')
    console.log('http server listening on port ' + server.address().port);
    console.log('========================================================')
});

var multer = require('multer');
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname == "BundlePic") {
            cb(null, 'public/uploads/bundleCover')
        }
        else if (file.fieldname == "itemImage"){
            cb(null, 'public/uploads/itemImage')
        }

    },
    filename: (req, file, cb) => {
      cb(null,  Date.now() + '-' + file.originalname)

    }
});
var upload = multer({storage: storage});