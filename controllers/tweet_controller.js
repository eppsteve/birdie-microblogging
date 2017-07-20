var DateTime = require('datetime-converter-nodejs'); // used for convertion to isodate
var ObjectID = require('mongodb').ObjectID; 


var User = require('../models/user.js');
var Tweet = require('../models/tweet.js');

exports.postTweet = function(req, res){

    if (req.body.tweet){
        // limit every tweet to 140 characters
         if (req.body.tweet.length <= 140){

            // get user's avatar from db, maybe he changed it in this session
            User.findOne({"username":req.user.username}, function(err, result){
                if (err) avatar = req.user.avatar; //if error occurs use the old avatar

                 //prepate tweet
                var post = new Tweet();
                post.username = req.user.username;
                console.log(result);
                console.log(result.avatar);
                post.avatar = result.avatar;
                post.tweet = req.body.tweet;
                post.created_at = new Date();

                // insert to db
                post.save(function(err){
                    if (err){
                        console.log(err);
                        return json({"message":"failed to post tweet"});
                    }else {

                        console.log("a new tweet has been posted");
                        return res.json({
                            "message": "Your tweet has been posted!", 
                            "tweet": post.tweet, 
                            "created_at": post.created_at, 
                            "username": post.username, 
                            "avatar": post.avatar
                        });
                    }
                });
            });
        }else {
            res.json({"message":"Your tweet is too long."});
        }
    }else {
        res.json({"message":"Your tweet is empty!"});
    }
}


exports.getTweet = function(req, res){
    Tweet.findOne({ '_id':ObjectID(req.params.id) }).exec(function(err, tweet){
        if (err) console.log(err);

        // console.log(tweet);
        res.json(tweet);
    });
}


exports.postReply = function(req, res){

    var tweetId = req.params.tweetId;
    var username = req.user.username;
    var message = req.body.message;
    var avatar;
    var created_at = new Date();

    // get avatar from db
    User.findOne({"username":req.user.username}, function(err, result){
            if (err) avatar = req.user.avatar; //if error occurs use the old avatar
            avatar = result.avatar;

    // insert reply into db
    Tweet.update({ '_id':ObjectID(tweetId) }, {$addToSet: {
        'replies':{
            'username':username, 
            'message':message, 
            'avatar':avatar, 
            'created_at':created_at
        }
    }}, function(err, result){
            if (err) console.log(err);

            // send response back to user
            res.json(
                {
                    "message":"reply posted", 
                    "reply":{
                        "username":username, 
                        "message":message, 
                        "avatar":avatar, 
                        "created_at":created_at
                    }
                });
        });
    });
}


exports.getLastTweets = function(req, res, next){
    // [req.user.follows] contains all the users that we follow
    var users_following = req.user.follows;

    
    // get the timestamp of our last check for new tweets
    var timestamp = req.params.timestamp;
    var last_check = DateTime.isoString(timestamp);
    console.log(last_check);


    // get all the users we follow
        User.findOne({"username":req.user.username}).exec(function(err, data){
            if (err) console.log(err);

            if (data.follows.length >0 ){
                // we follow some people, retrieve all their new tweets
                data.follows.push({"username":req.user.username}); // we also want to retrieve our tweets
                
                Tweet.find({
                $and: [
                    { $or: data.follows }, 
                    { "created_at" : { $gt : new Date(last_check) } } //we must convert isodate string to isodate object to be a valid mongodb isodate
                ]
                }).sort({"created_at":1}).exec(function(err, result){  //sort by date asc because jquery prepend() will reverse the order on client side
                    if (err)
                        console.log(err);

                    console.log(result.length +" new tweets");
                    if (result.length >0 ){
                        res.json({"tweets" : result, "timestamp":new Date()});
                    }else {
                        res.json({"tweets":"no new tweets", "timestamp":new Date()});
                    }
                });
            } else {
                // we do not follow anyone, get only our tweets
                Tweet.find({
                    $and: [
                        {"username":req.user.username}, 
                        { "created_at" : { $gt : new Date(last_check) }}
                    ]
                }).sort({"created_at":-1}).exec(function(err, result){
                    if (err)
                        console.log(err);

                    if (result.length >0 ){
                        res.json({"tweets" : result, "timestamp":new Date()});
                    }else {
                        // we have not posted anything
                        res.json({"tweets":"no new tweets", "timestamp":new Date()});
                    }
                });
            }
        });
}


exports.favTweet = function(req, res, next){
        Tweet.update({'_id':ObjectID(req.params.id)}, {$addToSet: {'favorited_by':req.user.username}}, function(err, result){
        if (err){
            console.log(err);
            res.json({"message":"failed"});
        }
        console.log(result);
        res.json({"message":"success"});
        });
}


exports.retweetTweet = function(req, res, next){
        Tweet.update({'_id':ObjectID(req.params.id)}, {$addToSet: {'retweeted_by':req.user.username}}, function(err, result){
        if (err){
            console.log(err);
            res.json({"message":"failed"});
        }
        console.log(result);
        res.json({"message":"success"});
        });
}