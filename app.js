var express = require('express');
var http = require('http');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');        // middleware to parse urlencoded request bodies into req.body
var hbs  = require('express-hbs');              // handlebars template engine
var session = require('express-session');       // midleware for session req.session
var fileUpload = require('express-fileupload'); // midleware for file upload req.files
var path = require('path');                     // used for file path
var passport = require('passport');             // middleware for authentication
var LocalStrategy = require('passport-local').Strategy;
var cookieParser = require('cookie-parser');
var User = require('./models/user.js');
var userController = require('./controllers/user_controller');
var homeController = require('./controllers/home_controller');
var tweetController = require('./controllers/tweet_controller');
var authController = require('./controllers/auth_controller');
var settingsController = require('./controllers/settings_controller');

var app = express();


app.set('port', process.env.PORT || 3000);
// view engine setup
app.set('views', path.join(__dirname, '/views'));
app.engine('hbs', hbs.express4({ 
    defaultLayout:__dirname +'/views/layouts/main',
    extname:'.hbs' 
}));
app.set('view engine', 'hbs');

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/uploads'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended:true }));
app.use(fileUpload());
app.use(session({
    secret:"nightfall", 
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());


// connect to db
mongoose.connect("mongodb://localhost:27017/birdie", function(err){
    if (!err){
        console.log("mongoose connected to mongodb.");
    }
});


/* Passport middleware needs to serialize and deserialize the user instance */
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});
passport.use(new LocalStrategy(function(username, password, done) {
  process.nextTick(function() {
    // Auth Check Logic
  User.findOne({
      'username': username, 
    }, function(err, user) {
      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false);
      }

      if (user.password != password) {
        return done(null, false);
      }

      return done(null, user);
    });
  });
}));

/* Route middleware to ensure user is logged in. 
   Passport attached a handy function isAuthenticated() to the req object, 
   and we can use it to determine if the user is authenticated. */
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
 
    //res.sendStatus(401);
    res.redirect('/');
}


/* ROUTING */
app.get('/', authController.getSiteIndex);
app.post('/login', passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/loginFailure', 
    session: true
  })
);
app.get('/loginFailure', authController.loginFailure);
app.get('/logout', authController.logout);
app.post('/register', authController.register);

app.get('/home', isLoggedIn, homeController.getHomeIndex);

app.get('/tweets/:timestamp', isLoggedIn, tweetController.getLastTweets);
app.post('/tweet', tweetController.postTweet);
app.get('/tweet/:id', tweetController.getTweet);
app.post('/reply/:tweetId', tweetController.postReply);
app.get('/fav/:id', isLoggedIn, tweetController.favTweet);
app.get('/retweet/:id', isLoggedIn, tweetController.retweetTweet);

app.get('/user/:user', isLoggedIn, userController.getUser);
app.get('/unfollow/:user', isLoggedIn, userController.unfollowUser);
app.get('/follow/:user', isLoggedIn, userController.followUser);

app.get('/settings', isLoggedIn, settingsController.getSettings);
app.post('/upload', settingsController.postUpload);

http.createServer(app).listen(app.get('port'), function(){
    console.log('server is listening on port ' + app.get('port'));
});