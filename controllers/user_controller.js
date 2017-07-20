var async = require('async');
var User = require('../models/user.js');
var Tweet = require('../models/tweet.js');

exports.followUser = function(req, res, next){
    User.update({'username':req.user.username}, {$addToSet: {'follows':{'username':req.params.user}}}, function(err, result){
    if (err){
        console.log(err);
        res.json({"message":"failed"});
    }
    res.json({"message":"success", "user":req.params.user});
    });
}

exports.unfollowUser = function(req, res, next){
    var username = req.user.username;
    //var user = req.user;
        User.update({'username':username}, {$pull: {'follows':{'username':req.params.user}}}, function(err, result){
        if (err){
            console.log(err);
            res.json({"message":"failed"});
        }

        res.json({"message":"success"}, {"user":req.params.user});
        });
}

exports.getUser = function(req, res, next){
    var username = req.params.user;
    var myself = false;

    // check if this user is the logged-in user
    if (username == req.user.username){
        myself = true;
    }

    var data;
    var tweets;

    async.series([
        function(callback){
            Tweet.find({ $or : [{"username":username}, {"retweeted_by":username}] }).sort({"created_at":-1}).exec(function(err, posts){
                if (err) res.redirect('/');
                
                tweets = posts;

                callback();
            });
        }, 
        function(callback){
             User.findOne({"username":username}).exec(function(err, user){
                if (err) res.redirect('/');

                data = user;
                // console.log("my data" +data);
                
                callback();
             });
        },
        function(callback){
            User.findOne({ $and: [{"username":req.user.username}, {"follows": {"username":username}}] }).exec(function(err, foll){
                if (foll){
                    if (foll.follows.length > 0)
                        data.do_we_follow = true;
                }

                callback();
            });
        }
    ], function(err, results){

            if (data){
                return  res.render('user', {
                    "user":username, 
                    "avatar":data.avatar,
                    "cover":data.cover,  
                    "numOfPosts":tweets.length, 
                    "numOfFollowing":data.numOfFollowing,  
                    "following":data.do_we_follow, 
                    "myself":myself, 
                    "username":req.user.username, 
                    "myavatar":req.user.avatar, 
                    "tweets": tweets
                });
            }   
    });
}