var passport = require('passport');             // middleware for authentication
var User = require('../models/user.js');

exports.getSiteIndex = function(req, res){
    // check if user is already logged-in
    if (req.isAuthenticated()){
        res.redirect('/home');
    }else {
    res.render('index');
    }
}


exports.loginFailure = function(req, res, next) {
  res.render('index', {"message":"Wrong username or password!"});
}


exports.logout = function(req, res){
    //req.session.destroy();
    req.logout();
    console.log('a user logged out');
    res.json({"message":"log out success"});
}


exports.register = function(req, res){
    var email = req.body.email;
    var username = req.body.name;
    var password = req.body.password;
    var password_confirm = req.body.password_confirm;

    // check if all fields have been filled
    if (email && username && password && password_confirm){
        // check if passwords match
        if (password == password_confirm){
            // check if email has already been registered
            User.find({"email":email}, function(err, result){
                if (err){
                    console.log(err);
                    res.redirect('/');
                }

                if (result.length > 0){
                    return res.render('index', {"message":"This email is already registered!"});
                }else{

                    // username has to be unique, check if already exists
                    User.find({"username":username}, function(err, result){
                        if (err)
                            res.redirect('/');

                            if (result.length > 0)
                                res.render('index', {"message":"This username already exists!"});

                            else{

                                 // create a new user
                                var user = new User();
                                user.email = email;
                                user.username = username;
                                user.password = password;
                                user.avatar = "";
                                user.created_at = new Date();

                                // add new user to db
                                user.save(function(err){
                                    if (err){
                                        console.log(err);
                                        return res.redirect('/');
                                    }else {

                                        console.log("A new user has been registered!");
                                        console.log(user.username);
                                        // login using passport and redirect to homepage
                                        // req.session.user = result.ops[0];
                                        // res.redirect('/home');
                                        req.login(user, function (err) {
                                            if ( ! err ){
                                                res.redirect('/home');
                                            } else {
                                                res.redirect('/');
                                            }
                                        });
                                    }
                                });

                            }
                    });

                   
                }
            });
        }else {
            return res.render('index', {"message":"Passwords do not match!"})
        }
    }else {
        return res.render('index', {"message":"All fields are required!"});
    }
}